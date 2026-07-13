import { Customer, User } from '../types';

export const checkAndTriggerBirthdays = async (
    customers: Customer[],
    currentUser: User,
    users: User[],
    addNotification: (data: any) => Promise<void>,
    addTaskToLead: (leadId: string, data: any) => Promise<void>
) => {
    // Only administrators or the system context can run the daily trigger check
    if (!currentUser || !['Super Admin', 'Admin'].includes(currentUser.role)) return;

    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format in local time
    const lastCheck = localStorage.getItem('last_birthday_trigger_check');
    
    // Run only once per day
    if (lastCheck === todayStr) return;

    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    const birthdayCustomers = customers.filter(c => {
        if (!c.date_of_birth) return false;
        const parts = c.date_of_birth.split('-');
        if (parts.length < 3) return false;
        const dobMonth = parseInt(parts[1], 10);
        const dobDay = parseInt(parts[2], 10);
        return dobMonth === currentMonth && dobDay === currentDay;
    });

    for (const customer of birthdayCustomers) {
        // 1. Generate role-based notifications for Admin, Super Admin, and Assigned Sales Executive
        const notificationReceivers = users.filter(u => 
            ['Super Admin', 'Admin'].includes(u.role) || 
            u.id === customer.assigned_to?.id
        );

        for (const receiver of notificationReceivers) {
            try {
                await addNotification({
                    user_id: receiver.id,
                    type: 'Note Added',
                    title: '🎂 Customer Birthday Today!',
                    message: `${customer.name}'s birthday is today. Don't forget to send them your warm wishes!`,
                    link: { page: 'Customer Detail', id: customer.id }
                });
            } catch (e) {
                console.error("Failed to trigger birthday notification", e);
            }
        }

        // 2. Automatically create a CRM task on the associated lead if present
        if (customer.lead_id) {
            try {
                await addTaskToLead(customer.lead_id, {
                    content: `Wish Customer Birthday: ${customer.name}`,
                    due_date: todayStr,
                    priority: 'Medium',
                    created_by: currentUser
                });
            } catch (e) {
                console.error("Failed to create birthday task", e);
            }
        }
    }

    localStorage.setItem('last_birthday_trigger_check', todayStr);
};
