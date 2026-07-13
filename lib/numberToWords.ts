
export function numberToWords(amount: number): string {
    if (amount === 0) return "Zero Rupees";

    const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const convertLessThanOneThousand = (n: number): string => {
        let str = "";
        if (n >= 100) {
            str += units[Math.floor(n / 100)] + " Hundred ";
            n %= 100;
        }
        if (n >= 10 && n <= 19) {
            str += teens[n - 10] + " ";
        } else if (n >= 20) {
            str += tens[Math.floor(n / 10)] + " ";
            n %= 10;
        }
        if (n > 0 && n < 10) {
            str += units[n] + " ";
        }
        return str;
    };

    let str = "";
    // Crores
    if (amount >= 10000000) {
        str += convertLessThanOneThousand(Math.floor(amount / 10000000)) + "Crore ";
        amount %= 10000000;
    }
    // Lakhs
    if (amount >= 100000) {
        str += convertLessThanOneThousand(Math.floor(amount / 100000)) + "Lakh ";
        amount %= 100000;
    }
    // Thousands
    if (amount >= 1000) {
        str += convertLessThanOneThousand(Math.floor(amount / 1000)) + "Thousand ";
        amount %= 1000;
    }
    // Hundreds and units
    if (amount > 0) {
        str += convertLessThanOneThousand(amount);
    }

    return str.trim() + " Rupees";
}
