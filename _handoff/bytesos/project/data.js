// BytesOS — live ops data for a 4-partner uni food business
// Today is "Sat, Apr 18, 2026"

const TODAY_LABEL = "Saturday, April 18";

// 14-day revenue history (most recent last = today)
const rev14 = [11200, 13400, 9800, 15600, 14100, 18700, 21400, 16200, 13800, 19500, 22100, 18400, 24800, 21600];
const ord14 = [10, 12, 9, 14, 13, 16, 18, 14, 12, 17, 19, 16, 21, 19];
// Today so far (partial day, lunch done, dinner open)
const revToday = 21600;

window.DATA = {
  today: TODAY_LABEL,
  // sticky session tab
  tabs: ["overview", "orders", "debt", "customers"],

  metrics: {
    todayRevenue: revToday,
    todayOrders: 19,
    todayTarget: 25000,
    weekRevenue: rev14.slice(-7).reduce((a, b) => a + b, 0),
    weekOrders: ord14.slice(-7).reduce((a, b) => a + b, 0),
    weekPrev: rev14.slice(0, 7).reduce((a, b) => a + b, 0),
    mtdRevenue: 487420,
    outstanding: 38650,
    outstandingCount: 9,
    repeatCustomers: 47,
    avgOrder: 1137,
  },

  rev14, ord14,

  // today's hour-by-hour order heat
  hourly: [
    { h: 11, orders: 0 }, { h: 12, orders: 4 }, { h: 13, orders: 6 },
    { h: 14, orders: 3 }, { h: 15, orders: 2 }, { h: 16, orders: 1 },
    { h: 17, orders: 0 }, { h: 18, orders: 2 }, { h: 19, orders: 1 },
    { h: 20, orders: 0 }, { h: 21, orders: 0 }, { h: 22, orders: 0 },
  ],

  // realtime activity feed
  activity: [
    { id: 101, t: "14:42", who: "Ayesha Tariq",     what: "ordered 2× Standard",                amount: 2400, paid: true,  slot: "Lunch" },
    { id: 100, t: "14:38", who: "Hamza Raza",       what: "ordered 1× Standard + Fries",        amount: 1600, paid: true,  slot: "Lunch" },
    { id: 99,  t: "14:15", who: "Usman Ali",        what: "ordered 3× Standard",                amount: 3300, paid: false, slot: "Lunch" },
    { id: 98,  t: "13:58", who: "Mehreen Siddiqui", what: "ordered 2× Standard + 2× Fries",     amount: 3200, paid: true,  slot: "Lunch" },
    { id: 97,  t: "13:42", who: "Noor Fatima",      what: "ordered 1× Standard",                amount: 1200, paid: false, slot: "Lunch" },
    { id: 96,  t: "13:30", who: "Bilal Ahmed",      what: "ordered 2× Standard",                amount: 2400, paid: true,  slot: "Lunch" },
    { id: 95,  t: "13:12", who: "Zara Malik",       what: "paid outstanding PKR 2,400",         amount: 2400, paid: true,  slot: "—", kind: "payment" },
    { id: 94,  t: "13:05", who: "Saba Qureshi",     what: "ordered 1× Standard + Fries",        amount: 1600, paid: true,  slot: "Lunch" },
    { id: 93,  t: "12:48", who: "Haris Mahmood",    what: "ordered 2× Standard",                amount: 2400, paid: false, slot: "Lunch" },
    { id: 92,  t: "12:30", who: "Faisal Khan",      what: "ordered 1× Standard",                amount: 1200, paid: true,  slot: "Lunch" },
  ],

  // open orders (unpaid from today — need to chase)
  openOrders: [
    { id: 99, who: "Usman Ali",     order: "3× Standard",       amount: 3300, age: "2h",  slot: "Lunch" },
    { id: 97, who: "Noor Fatima",   order: "1× Standard",       amount: 1200, age: "3h",  slot: "Lunch" },
    { id: 93, who: "Haris Mahmood", order: "2× Standard",       amount: 2400, age: "3h",  slot: "Lunch" },
  ],

  // tonight's dinner slot preorders
  upcoming: [
    { who: "Ayesha Tariq",    order: "2× Standard",         amount: 2400, slot: "Dinner · 19:00" },
    { who: "Hamza Raza",      order: "1× Standard + Fries", amount: 1600, slot: "Dinner · 19:30" },
    { who: "Rameen Chaudhry", order: "2× Standard",         amount: 2400, slot: "Dinner · 20:00" },
    { who: "Umer Javed",      order: "1× Standard",         amount: 1200, slot: "Dinner · 20:00" },
  ],

  // all outstanding (aged)
  debt: [
    { name: "Usman Ali",      owed: 9800, oldest: 22, orders: 4 },
    { name: "Noor Fatima",    owed: 7200, oldest: 18, orders: 3 },
    { name: "Haris Mahmood",  owed: 6400, oldest: 12, orders: 3 },
    { name: "Sanam Iqbal",    owed: 5100, oldest:  9, orders: 2 },
    { name: "Kashif Butt",    owed: 3900, oldest:  6, orders: 2 },
    { name: "Areeba Shah",    owed: 2800, oldest:  4, orders: 1 },
    { name: "Junaid Hussain", owed: 1650, oldest:  3, orders: 1 },
    { name: "Farhan Akhtar",  owed: 1100, oldest:  2, orders: 1 },
    { name: "Saad Nawaz",     owed:  700, oldest:  1, orders: 1 },
  ],

  topCustomers: [
    { name: "Ayesha Tariq",     orders: 22, spend: 48600, last: "today",   trend: "up"   },
    { name: "Hamza Raza",       orders: 18, spend: 41200, last: "today",   trend: "up"   },
    { name: "Mehreen Siddiqui", orders: 16, spend: 37800, last: "today",   trend: "flat" },
    { name: "Bilal Ahmed",      orders: 14, spend: 31400, last: "today",   trend: "up"   },
    { name: "Zara Malik",       orders: 12, spend: 28900, last: "yest.",   trend: "flat" },
    { name: "Faisal Khan",      orders: 11, spend: 24100, last: "6d ago",  trend: "down" },
    { name: "Saba Qureshi",     orders:  9, spend: 21300, last: "today",   trend: "up"   },
    { name: "Umer Javed",       orders:  8, spend: 18400, last: "4d ago",  trend: "flat" },
  ],

  // the 4 partners (you + 3 friends)
  partners: [
    { name: "Zain",   role: "Kitchen",    share: 25, avatar: "Z", color: "#f97316" },
    { name: "Ali",    role: "Delivery",   share: 25, avatar: "A", color: "#22c55e" },
    { name: "Omar",   role: "Orders",     share: 25, avatar: "O", color: "#3b82f6" },
    { name: "Hasan",  role: "Everything", share: 25, avatar: "H", color: "#a855f7" },
  ],
};
