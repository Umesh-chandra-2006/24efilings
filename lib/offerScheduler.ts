import { Offer, User } from '../types';
import { supabase } from './supabaseClient';

export const checkAndTriggerOfferStatus = async (
    offers: Offer[],
    currentUser: User,
    users: User[],
    addNotification: (data: any) => Promise<void>,
    updateOffer: (id: string, updates: Partial<Offer>) => Promise<void>
) => {
    // Only administrators or the system context can run the daily trigger check
    if (!currentUser || !['Super Admin', 'Admin'].includes(currentUser.role)) return;

    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local format
    const lastCheck = localStorage.getItem('last_offer_scheduler_check');

    // Run only once per day
    if (lastCheck === todayStr) return;

    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);

    const notificationReceivers = users.filter(u => ['Super Admin', 'Admin'].includes(u.role));

    for (const offer of offers) {
        if (offer.status !== 'active') continue;

        const endDateObj = new Date(offer.end_date);
        endDateObj.setHours(0, 0, 0, 0);

        const diffTime = endDateObj.getTime() - todayObj.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // 1. Expired Offers Check
        if (diffDays < 0) {
            try {
                // Set status to inactive in database
                await updateOffer(offer.id, { status: 'inactive' });

                // Dispatch expired notification
                for (const receiver of notificationReceivers) {
                    await addNotification({
                        user_id: receiver.id,
                        type: 'Note Added',
                        title: '⚠️ Promo Offer Expired',
                        message: `The promo offer "${offer.name}" (${offer.promo_code}) has officially expired.`,
                    });
                }
            } catch (err) {
                console.error(`Failed to handle expired offer ${offer.promo_code}:`, err);
            }
        }
        // 2. Expiring in next 48 hours Check
        else if (diffDays <= 2 && diffDays >= 0) {
            try {
                // Dispatch warning notification to avoid repeated sends for the day
                for (const receiver of notificationReceivers) {
                    await addNotification({
                        user_id: receiver.id,
                        type: 'Note Added',
                        title: '⏳ Promo Offer Expiring Soon',
                        message: `The promo offer "${offer.name}" (${offer.promo_code}) is expiring in ${diffDays} day(s) on ${offer.end_date}.`,
                    });
                }
            } catch (err) {
                console.error(`Failed to trigger warning for expiring offer ${offer.promo_code}:`, err);
            }
        }
    }

    localStorage.setItem('last_offer_scheduler_check', todayStr);
};
