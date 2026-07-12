# 🌟 OtenDANA - DANA OTP Dashboard

> **Premium glassmorphism dashboard** to receive SMS and OTP codes for DANA instantly using virtual numbers from SMSBower API.

[![Node.js](https://img.shields.io/badge/Node.js-v16+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## ✨ Features

### 🎨 **Modern UI/UX**
| Feature | Description |
|---------|-------------|
| 🌌 **Animated Gradient Background** | Dynamic floating gradient orbs with smooth animations |
| 🪟 **Glassmorphism Design** | Premium glass-morphic cards with backdrop blur effects |
| ✨ **Glow Effects** | Interactive glow on hover for buttons and cards |
| 🎭 **Smooth Animations** | Fluid transitions with cubic-bezier easing |
| 🎨 **Vibrant Color Palette** | Purple-blue-cyan gradients for modern aesthetic |
| 📱 **Fully Responsive** | Optimized for desktop, tablet, and mobile devices |

### 🚀 **Core Functionality**
| Feature | Description |
|---------|-------------|
| 🔢 **Virtual Numbers** | Get temporary virtual numbers for DANA verification |
| 💰 **Real-time Pricing** | Live prices and stock from multiple operators |
| 🏆 **Rank System** | Gold, Silver, Bronze operators with delivery rates |
| 🔔 **Instant OTP Detection** | Auto-polling every 5 seconds to catch SMS codes |
| 📋 **Dual Copy Formats** | Copy number with or without country code |
| ⏱️ **25-Minute Timer** | Visual countdown timer for each active order |
| 🔄 **Multiple OTP History** | Track all OTP codes received in one order |
| 📜 **Order History** | View past activations with pagination & filters |
| 🔊 **Sound Notifications** | Audio alerts when OTP is received |
| 🌙 **Dark Theme** | Eye-comfortable dark mode interface |

---

## 🎨 Design Highlights

### **Visual Effects**
- 🌈 **Animated Background**: Three gradient orbs (purple, pink, cyan) floating smoothly
- 💎 **Glassmorphism Cards**: `backdrop-filter: blur(20px)` with rgba transparency
- ⚡ **Ripple Animation**: Button click effects with expanding circles
- 🌟 **Glow on Hover**: Dynamic box-shadow with rgba blur
- 📊 **Pulse Animation**: Breathing effect on badges and icons
- 🎯 **Scale Transform**: Subtle zoom on interactive elements

### **Color Palette**
```css
Primary Gradient:   #667eea → #764ba2 (Purple-Blue)
Accent Gradient 1:  #f093fb → #f5576c (Pink-Red)
Accent Gradient 2:  #4facfe → #00f2fe (Cyan-Blue)
Success:            #34d399 (Emerald)
Glass Background:   rgba(30, 41, 59, 0.7)
```

---

## 🛠️ Tech Stack

### **Backend**
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Axios** - HTTP client for API requests
- **dotenv** - Environment variable management
- **CORS** - Cross-origin resource sharing

### **Frontend**
- **HTML5** - Semantic markup
- **CSS3** - Modern animations & effects
  - Glassmorphism
  - Backdrop filters
  - Keyframe animations
  - CSS Grid & Flexbox
- **Tailwind CSS** - Utility-first styling
- **Vanilla JavaScript** - No framework dependencies
- **LocalStorage** - Client-side persistence
- **Font Awesome 6** - Icon library
- **Google Fonts (Inter)** - Typography

### **API Integration**
- **SMSBower API** - SMS activation service
  - Service: `fr` (DANA)
  - Country: `6` (Indonesia)
  - Endpoints: `getPricesV3`, `getTopCountriesByService`, `getNumber`, `getStatus`

---

## 📦 Installation

### **Prerequisites**
- Node.js (v16 or higher)
- npm (v8 or higher)
- SMSBower API key ([Get one here](https://smsbower.page))

### **Quick Start**

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
   # Create .env file
   echo "SMSBOWER_API_KEY=your_api_key_here" > .env
   echo "PORT=3010" >> .env
   ```

4. **Start the server**
   ```bash
   node server.js
   ```

5. **Open in browser**
   ```
   http://localhost:3010
   ```

---

## ⚙️ Configuration

### **Environment Variables (.env)**

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SMSBOWER_API_KEY` | ✅ Yes | - | Your API key from [SMSBower](https://smsbower.page) |
| `PORT` | ❌ No | `3010` | Server port number |

### **Example .env**
```env
SMSBOWER_API_KEY=abc123xyz456
PORT=3010
```

---

## 🚀 Usage Guide

### **Step-by-Step**

| Step | Action | Description |
|------|--------|-------------|
| **1** | 🔍 Browse Operators | View real-time prices sorted by rank (Gold/Silver/Bronze) |
| **2** | 🎯 Select Price | Click on a price card to select an operator |
| **3** | 🛒 Buy Number | Click "Buy Now" to get a virtual number |
| **4** | 📋 Copy Number | Click on number cards to copy (with/without country code) |
| **5** | ⏳ Wait for OTP | System auto-polls every 5 seconds |
| **6** | 📩 Receive OTP | OTP displays with sound notification |
| **7** | ✅ Complete | Click "Complete" or request another SMS |

### **Available Actions**

| Button | When Available | Action |
|--------|----------------|--------|
| 🛒 **Buy Now** | Always | Request a new virtual number |
| ❌ **Cancel** | Before OTP | Cancel order and get refund |
| 🔄 **Receive Another SMS** | After OTP | Request additional SMS to same number |
| ✅ **Complete** | After OTP | Finish order successfully |
| 📋 **Copy** | Active order | Copy number/OTP to clipboard |
| 📜 **View History** | Always | Access past orders |

### **Operator Ranks**

| Rank | Delivery Rate | Volume | Description |
|------|---------------|--------|-------------|
| 🥇 **Gold** | 40%+ | 2000+/day | Maximum reliability & delivery |
| 🥈 **Silver** | 20-40% | 1000+/day | Promising positions |
| 🥉 **Bronze** | 5-20% | up to 1000/day | Suitable for limited budget |

---

## 🔌 API Endpoints

### **Server Endpoints**

| Endpoint | Method | Query Params | Description |
|----------|--------|--------------|-------------|
| `/api/balance` | GET | - | Check current SMSBower balance |
| `/api/dana-operators` | GET | - | Get operator list with prices & stock |
| `/api/get-dana-number` | GET | `operatorId`, `maxPrice`, `minPrice` | Purchase a virtual number |
| `/api/status/:id` | GET | - | Check OTP status for activation ID |
| `/api/set-status/:id/:status` | GET | - | Update order status (1=retry, 6=complete, 8=cancel) |
| `/api/history` | GET | - | Retrieve order history |
| `/api/debug` | GET | - | Debug API responses |

### **Example Requests**

```bash
# Get balance
curl http://localhost:3010/api/balance

# Get operators
curl http://localhost:3010/api/dana-operators

# Get number
curl "http://localhost:3010/api/get-dana-number?operatorId=1329&maxPrice=0.008&minPrice=0.006"

# Check status
curl http://localhost:3010/api/status/492506304

# Complete order
curl http://localhost:3010/api/set-status/492506304/6
```

---

## 📁 Project Structure

```
otendana/
├── 📄 server.js              # Express server with API routes
├── 📄 .env                   # Environment variables (not in git)
├── 📄 .env.example           # Example environment config
├── 📄 package.json           # Dependencies & scripts
├── 📄 package-lock.json      # Lock file
├── 📄 README.md              # This file
├── 📄 preview.html           # Design preview file
└── 📁 public/                # Static frontend files
    ├── 📄 index.html         # Main dashboard (glassmorphism)
    ├── 📄 history.html       # Order history page
    ├── 📄 app.js             # Frontend logic (795 lines)
    └── 🖼️ dana.png           # DANA logo image
```

---

## 💾 Data Storage

### **LocalStorage Keys**

| Key | Type | Max Size | Description |
|-----|------|----------|-------------|
| `dana_active_orders` | Array | 6 orders | Current active orders with polling state |
| `dana_history` | Array | 200 records | Order history (100 success + 100 cancelled) |
| `theme` | String | - | Theme preference (always 'dark') |

### **Order Object Structure**
```javascript
{
  activationId: "492506304",
  number: "+6285141686028",
  numberWithoutCode: "85141686028",
  numberWithCode: "6285141686028",
  service: "DANA",
  country: "Indonesia",
  price: 0.007,
  rank: "Gold",
  operator: "Gold Partner 1329",
  operatorId: "1329",
  status: "waiting|received|cancelled",
  otp: "123456",
  otpHistory: [{otp: "123456", timestamp: 1234567890, date: "..."}],
  createdAt: 1234567890
}
```

---

## 🎯 Features Deep Dive

### **Real-time Price Fetching**
- Combines two API endpoints: `getTopCountriesByService` + `getPricesV3`
- Client-side caching for 2 minutes
- Automatic fallback data if API fails
- Price range: $0.007 - $0.102

### **Smart OTP Detection**
- Polls API every 5 seconds per active order
- Stores multiple OTP codes in history array
- Prevents duplicate OTP entries
- Auto-stops polling on success/cancel

### **Persistent State Management**
- Active orders sync with localStorage
- Survives page refresh
- Resume polling on page load
- History with timestamp sorting

### **Responsive Notifications**
- Browser notifications (requires permission)
- Sound alerts on OTP (double beep)
- Toast messages for actions
- Title bar updates with OTP

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push** to the branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request

### **Contribution Guidelines**
- Follow existing code style
- Add comments for complex logic
- Test thoroughly before PR
- Update documentation if needed

---

## 🐛 Known Issues & Roadmap

### **Current Limitations**
- Maximum 6 concurrent active orders
- No backend authentication
- History limited to 200 records (100+100)
- Dark mode only (no light theme)

### **Future Enhancements**
- [ ] User authentication system
- [ ] Payment gateway integration
- [ ] Multi-service support (beyond DANA)
- [ ] Advanced filtering & search
- [ ] Export history to CSV/JSON
- [ ] WebSocket for real-time updates
- [ ] Admin dashboard
- [ ] Rate limiting & quota management

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[SMSBower](https://smsbower.page)** - Reliable SMS activation API
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Font Awesome](https://fontawesome.com/)** - Comprehensive icon library
- **[Google Fonts](https://fonts.google.com/)** - Inter font family
- **[Express.js](https://expressjs.com/)** - Fast web framework

---

## ⚠️ Disclaimer

> **Important:** This tool is designed for **educational and legitimate verification purposes only**. 
> 
> Users are solely responsible for:
> - Complying with local laws and regulations
> - Adhering to terms of service of platforms used
> - Ethical use of SMS verification services
> - Not engaging in fraudulent activities
> 
> The developers assume no liability for misuse of this software.

---

## 👤 Author

**Devano Naufal**

- 🐙 GitHub: [@devanonaufal](https://github.com/devanonaufal)
- 💬 Telegram: [@sphixray](https://t.me/sphixray)
- 📧 Email: [Your Email]

---

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/devanonaufal/otendana?style=social)
![GitHub forks](https://img.shields.io/github/forks/devanonaufal/otendana?style=social)
![GitHub issues](https://img.shields.io/github/issues/devanonaufal/otendana)
![GitHub pull requests](https://img.shields.io/github/issues-pr/devanonaufal/otendana)

---




