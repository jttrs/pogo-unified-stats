# Pokemon GO Unified Stats

A comprehensive web application that helps Pokemon GO players determine if their Pokemon are worth powering up by combining PVP rankings from PVPoke with raid effectiveness data inspired by DialGADex.

![Pokemon GO Unified Stats](./preview.png)

## Features

### 🎯 Unified Analysis
- **PVP Rankings**: Complete rankings across all leagues (Great, Ultra, Master, Premier)
- **Raid Effectiveness**: Tier-based raid performance evaluation
- **Investment Recommendations**: AI-powered suggestions on whether to power up your Pokemon

### 🔍 Smart Search & Discovery
- **Autocomplete Search**: Find Pokemon quickly with intelligent suggestions
- **Advanced Filtering**: Filter by type, league, score, and more
- **Top Pokemon Lists**: Discover the best performers across all categories

### 📊 Data Visualization
- **Interactive Charts**: Radar and bar charts for easy stat comparison
- **League Performance**: Visual breakdown of performance across different leagues
- **Side-by-Side Comparison**: Compare up to 4 Pokemon simultaneously

### 📱 Modern Interface
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Pokemon GO Styling**: Familiar color scheme and UI elements
- **Fast Performance**: Optimized for quick loading and smooth interactions

## Data Sources

### Live PVPoke Integration
- **Real-time data** from [PVPoke.com](https://pvpoke.com) rankings API
- Complete movesets and stat information
- Rankings for all competitive leagues (Great, Ultra, Master, Premier)
- Automatically fetches latest meta updates

### Live DialGADex Integration  
- **Real-time raid effectiveness data** from [DialGADex.com](https://www.dialgadex.com)
- Pokemon effectiveness against different raid boss types using eDPS metrics
- S+, S, A, B, C tier classifications across all Pokemon types
- Automatically crawls type-specific rankings

## Technology Stack

- **Frontend**: React 18 with modern hooks
- **Styling**: Tailwind CSS with custom Pokemon GO theme
- **Charts**: Recharts for interactive data visualization
- **Data Processing**: Papa Parse for CSV handling
- **Routing**: React Router for single-page application navigation
- **Build Tool**: Vite for fast development and optimized builds

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/pogo-unified-stats.git
   cd pogo-unified-stats
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.jsx      # Navigation header
│   ├── PokemonCard.jsx # Pokemon display card
│   ├── SearchBar.jsx   # Search with autocomplete
│   └── StatsChart.jsx  # Chart visualizations
├── pages/              # Main application pages
│   ├── HomePage.jsx    # Landing page with search
│   ├── PokemonDetailsPage.jsx # Detailed Pokemon view
│   ├── RankingsPage.jsx # League rankings
│   └── ComparisonPage.jsx # Pokemon comparison
├── context/            # React context for state management
│   └── DataContext.jsx # Data loading and management
├── App.jsx            # Main app component
└── main.jsx           # Entry point
```

## Data Management

### Live Data Fetching
The app automatically fetches real-time data from external sources:

**PVP Data Sources:**
- `https://pvpoke.com/data/rankings/all/1500/overall.json` - Great League rankings
- `https://pvpoke.com/data/rankings/all/2500/overall.json` - Ultra League rankings  
- `https://pvpoke.com/data/rankings/all/10000/overall.json` - Master League rankings
- `https://pvpoke.com/data/rankings/premier/10000/overall.json` - Premier Cup rankings

**Raid Data Sources:**
- `https://www.dialgadex.com/?strongest&t=Any` - Overall strongest attackers
- `https://www.dialgadex.com/?strongest&t={Type}` - Type-specific raid effectiveness
- Crawls all 18 Pokemon types for comprehensive raid data
- Uses eDPS (Effective DPS) metrics and tier classifications

### Fallback System
- Robust error handling with fallback data if external sources are unavailable
- CORS proxy support for client-side data fetching
- Automatic retry mechanisms and graceful degradation

## Features in Detail

### Smart Recommendations
The app analyzes both PVP and raid performance to provide intelligent recommendations:

- **⭐ Highly Recommended**: Excellent in both PVP and raids (85+ scores)
- **🎯 Great Investment**: Strong in one category, decent in other
- **👍 Solid Investment**: Good performance in specific situations
- **⚠️ Consider Carefully**: Limited competitive value
- **❌ Not Recommended**: Poor performance across all categories

### Advanced Filtering
- **League Selection**: Focus on specific competitive formats
- **Type Filtering**: Find the best Pokemon of each type
- **Score Sorting**: Rank by overall effectiveness
- **Search Integration**: Combine filters with text search

### Comparison Tools
- **Side-by-Side Stats**: Compare key metrics across Pokemon
- **Visual Charts**: Radar charts for easy pattern recognition
- **League Breakdown**: Performance analysis per competitive format
- **Export Functionality**: Download rankings as CSV files

## Contributing

We welcome contributions! Here's how you can help:

### Reporting Issues
- Use the GitHub issue tracker
- Provide detailed reproduction steps
- Include screenshots for UI issues

### Development Contributions
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Data Contributions
- Help improve Pokemon data accuracy
- Suggest new data sources
- Contribute raid effectiveness rankings

## Roadmap

### Short Term
- [x] Integration with live DialGADex data scraping
- [x] Live PVPoke API integration
- [ ] Enhanced error handling and offline mode
- [ ] User accounts and Pokemon collection tracking
- [ ] Move calculator and optimization tools

### Long Term
- [ ] Team builder with synergy analysis
- [ ] Battle simulator integration
- [ ] Community rankings and voting
- [ ] Mobile app version

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This application is not affiliated with Niantic, The Pokemon Company, or any official Pokemon GO entities. Pokemon and Pokemon GO are trademarks of their respective owners.

The app uses publicly available data for educational and analytical purposes. All Pokemon names, images, and game data are the property of their respective copyright holders.

## Acknowledgments

- **PVPoke.com** - For comprehensive PVP ranking data
- **DialGADex** - For inspiration on raid effectiveness analysis
- **Pokemon GO Community** - For ongoing meta analysis and feedback
- **Open Source Libraries** - React, Tailwind CSS, Recharts, and all dependencies

## Support

If you find this app helpful, consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs and suggesting features
- 🤝 Contributing code or data improvements
- 📢 Sharing with the Pokemon GO community

---

**Happy hunting, trainers!** 🎮⚡ 