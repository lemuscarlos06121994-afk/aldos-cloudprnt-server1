# Aldo's CloudPRNT Server

This is a very simple **CloudPRNT** server for **Aldo's Pizzeria** kiosk app.

- The **kiosk web app** sends the order to this server.
- The **Star CloudPRNT printer** polls this server and prints the latest order.

---

## Endpoints

### `POST /order`

The kiosk (Netlify app) should send the order here.

**Example request body:**

```json
{
  "ticket": "1x Cheese Pizza\n1x Taco Pizza\n1x Wings (10, BBQ)\n",
  "total": "$32.50",
  "payMethod": "cash",
  "orderType": "pickup"
}
