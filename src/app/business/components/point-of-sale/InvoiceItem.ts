import { InvoiceData } from "./point-of-sale.component";

export type PurchaseType = "PLAN" | "ADD_ON";

export class InvoiceItem implements InvoiceData {
    id: number;
    name: string;
    price: number;
    category?: string;
    image?: string;
    quantity: number;
    canHaveMultiple: boolean;
    type: string;
    selectedPlanQuantity: number;

    constructor(data: InvoiceData, selectedPlanQuantity: number = 1) {
        this.id = data.id;
        this.name = data.name;
        this.price = data.price;
        this.category = data.category;
        this.image = data.image;
        this.quantity = data.quantity;
        this.canHaveMultiple = data.canHaveMultiple;
        this.type = data.type;
        this.selectedPlanQuantity = selectedPlanQuantity;
    }

    // totalPrice getter, computed dynamically
    get totalPrice(): number {
        const multiplier = this.type == "ADD_ON" ? this.selectedPlanQuantity ?? 1 : 1;
        console.log(this.price, this.quantity, multiplier);
        return this.price * this.quantity * multiplier;
    }

    // Method to update quantity
    updateQuantity(operation: "increase" | "decrease"): boolean {
        if (!this.canHaveMultiple) {
            return false;
        }

        if (operation === "decrease") {
            if (this.type === "PLAN") {
                this.quantity -= 4;
                if (this.quantity <= 0) {
                    this.quantity = 0;
                    return true; // signal to clear invoice/plan if needed
                }
            } else {
                this.quantity = Math.max(0, this.quantity - 1);
            }
        } else if (operation === "increase") {
            if (this.type === "PLAN") {
                this.quantity += 4;
            } else {
                this.quantity++;
            }
        }
        return false;
    }
}
