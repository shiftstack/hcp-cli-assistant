# HCP CLI Assistant

Click [here](https://shiftstack.github.io/hcp-cli-assistant/) to open the assistant.

An interactive web UI wizard that helps users generate the correct `hcp create cluster openstack` command for deploying **HyperShift on OpenStack**.
The assistant guides users step-by-step through required and optional configurations, ensuring a smooth setup experience.

## Features
- Step-by-step wizard for easy input
- Copy-to-clipboard functionality

## Setup & Development

### 1. Clone the Repository
```sh
git clone https://github.com/YOUR_GITHUB_USERNAME/hcp-cli-assistant.git
cd hcp-cli-assistant
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Run Locally
```sh
npm run dev
```
Visit `http://localhost:5173/` in your browser.

### 4. Build for Production
```sh
npm run build
```

### 5. Deploy to GitHub Pages
The project is automatically deployed via **GitHub Actions**, but you can also deploy manually:
```sh
npm run deploy
```

## License
This project is open-source and available under the **Apache 2.0 License**.

---

Developed for HyperShift on OpenStack users.
