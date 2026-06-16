```markdown
# 📱 OtenDANA - DANA OTP Dashboard

> Receive SMS and OTP codes for DANA instantly using virtual numbers from SMSBower API.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔢 Virtual Numbers | Get temporary virtual numbers for DANA verification |
| 💰 Real-time Pricing | View live prices and stock for each operator |
| 🔔 Instant OTP Detection | Auto-polling every 5 seconds to catch SMS codes |
| 📋 Two Copy Formats | Copy number with or without country code |
| ⏱️ 25-Minute Timer | Countdown timer for each active order |
| 📜 Order History | View all past activations with status |
| 🔄 Retry & Cancel | Request another SMS or cancel order |
| 🌙 Dark Mode | Permanent dark theme for comfortable use |
| 🔊 Sound Notifications | Audio alerts when OTP is received |
| 📱 Responsive | Works on desktop, tablet, and mobile |

---

## 🛠️ Tech Stack

### Backend
- Node.js
- Express
- Axios
- dotenv

### Frontend
- Tailwind CSS
- Font Awesome
- Vanilla JavaScript
- LocalStorage

---

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)
- SMSBower API key

### Steps
```
1. **Clone the repository**
   ```bash
   git clone https://github.com/devanonaufal/otendana.git
   cd otendana
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file**
   ```env
   SMSBOWER_API_KEY=your_api_key_here
   PORT=3000
   ```

5. **Start the server**
   ```bash
   node server.js
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

---

## ⚙️ Configuration

### Environment Variables (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `SMSBOWER_API_KEY` | ✅ Yes | Your API key from SMSBower |
| `PORT` | ❌ No | Server port (default: 3000) |

---

## 🚀 Usage

| Step | Action |
|------|--------|
| 1 | Select DANA from the service list |
| 2 | Pick a price operator with available stock |
| 3 | Click "Buy Now" to get a virtual number |
| 4 | Copy the number for DANA registration |
| 5 | Wait for OTP (auto-detected) |
| 6 | Complete or cancel the order |

### Available Actions

| Action | Description |
|--------|-------------|
| **Buy Now** | Request a new virtual number |
| **Cancel** | Cancel an active order (before OTP) |
| **Receive Another SMS** | Request a new SMS (after OTP received) |
| **Complete** | Confirm and complete the order |
| **Copy Number** | Copy number with/without country code |
| **View History** | Access past order history |

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/balance` | GET | Check SMSBower balance |
| `/api/dana-operators` | GET | Get operator list with prices |
| `/api/get-dana-number` | GET | Get a virtual number |
| `/api/status/:id` | GET | Check OTP status |
| `/api/set-status/:id/:status` | GET | Update order status |
| `/api/history` | GET | Get order history |

---

## 📁 Project Structure

```
otendana/
├── server.js              # Express server
├── .env                   # Environment variables
├── .env.example           # Example environment config
├── package.json           # Dependencies
├── README.md              # Documentation
└── public/                # Static files
    ├── index.html         # Main dashboard
    ├── history.html       # History page
    ├── app.js             # Frontend logic
    └── dana.png           # DANA logo
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [SMSBower](https://smsbower.app/) - SMS activation API
- [Tailwind CSS](https://tailwindcss.com/) - UI framework
- [Font Awesome](https://fontawesome.com/) - Icons

---

## ⚠️ Disclaimer

This tool is for educational and legitimate verification purposes only. Users are responsible for complying with their local laws and the terms of service of any platforms they interact with.

---

## 👤 Author

**Devano Naufal**

- GitHub: [@devanonaufal](https://github.com/devanonaufal)
- Telegram: [@sphixray](https://t.me/sphixray)

---

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!
```

---

## 📁 `.env.example`

```env
# SMSBower API Key (required)
SMSBOWER_API_KEY=your_api_key_here

# Server Port (optional, default: 3000)
PORT=3000
```
