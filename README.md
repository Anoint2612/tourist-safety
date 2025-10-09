# 🧭 SafeVoyage — Smart Tourist Safety System

### Smart India Hackathon 2025

**Problem Statement ID:** SIH25002
**Title:** Smart Tourist Safety, Monitoring & Incident Response System using AI, Geo-Fencing and Blockchain-based Digital ID
**Theme:** Travel and Tourism
**Category:** Software
**Team:** Kursi Coders (ID 65411)

---

## 🚀 Overview

**SafeVoyage** is an intelligent safety and monitoring platform designed for tourists.
It enables **AI-assisted emergency reporting**, **real-time tracking**, and **transparent FIR workflows** through a unified ecosystem combining **mobile**, **web**, and **blockchain** technologies.

---

## 🎯 Problem Statement

Tourist safety remains a critical concern in India, especially in remote and high-traffic areas.
Existing emergency and FIR systems lack integration, multilingual support, and real-time monitoring, which slows down response times.

---

## 💡 Proposed Solution

SafeVoyage democratizes safety by allowing **phone-first EFIR filing**, **SOS alerts**, and **real-time geo-fence guidance**.
The system integrates **AI/ML**, **blockchain audit trails**, and **role-based workflows** to ensure fairness, transparency, and faster incident response.

### ✅ Key Features

* 📱 **Mobile App (Android/iOS)** — SOS trigger, e-FIR filing, multilingual UI
* 💻 **Admin Dashboard** — FIR triage, inspector assignment, analytics
* 🛰️ **Geofencing & Tracking** — Real-time zone alerts and breach notifications
* 🧾 **E-FIR Workflow** — Filing → Verification → Assignment → SMS acknowledgement
* 👥 **Role-based Access** — Admin, Operator, Inspector with audit logs
* ⚙️ **Offline-First UX** — Cached sessions, queued submissions, retry handling
* 🔔 **Notifications** — SMS + In-App alerts via WebSockets
* 🤖 **AI/ML** — Detects anomalies and misuse patterns for proactive safety

---

## 🧱 Technical Architecture

| Component               | Technology Stack                  |
| ----------------------- | --------------------------------- |
| **Mobile App**          | React Native, TypeScript, Redux   |
| **Backend API**         | Node.js, Express, MongoDB         |
| **Admin Dashboard**     | React.js, React Router            |
| **Geo-Spatial Service** | FastAPI, PostgreSQL + PostGIS     |
| **Blockchain Layer**    | Hardhat (for tourist digital IDs) |
| **Notifications**       | Twilio (SMS)                      |
| **Real-Time**           | REST APIs, WebSockets             |
| **Deployment**          | Docker, Nginx, CI/CD Pipeline     |

---

## 🧩 Implementation Flow

1. Tourist installs the SafeVoyage app and registers.
2. User sets up trip details and activates tracking.
3. Any SOS or EFIR triggers a backend workflow:

   * Verification by operator
   * Inspector assignment
   * SMS acknowledgement
4. Geo-fence breach alerts trigger WebSocket notifications.
5. Blockchain ensures immutable EFIR storage.
6. Admin dashboard shows analytics and live incident data.

---

## 📊 Feasibility & Viability

### **Feasibility**

* Built entirely with **open-source** technologies
* **Offline maps** via OpenStreetMap
* **Modular and scalable** across regions
* Easily integrates with **government APIs**

### **Viability**

* **Cost-effective** and aligns with **Digital India** goals
* Boosts **tourism confidence** and safety perception
* **Monetizable** via ads, premium features, or partnerships
* Supports **smart city and police modernization** initiatives

---

## 🌍 Impact & Benefits

| Area               | Benefit                                             |
| ------------------ | --------------------------------------------------- |
| **Social**         | Improves traveler trust and safety                  |
| **Economic**       | Drives tourism revenue growth                       |
| **Administrative** | Streamlines FIR handling and tracking               |
| **Technological**  | Leverages AI + Blockchain for secure, fast response |

### **Potential Impacts**

* Faster emergency response and coordination
* Real-time risk detection in high-risk areas
* Offline navigation for remote zones
* Regional growth in under-visited tourist regions

---
## 📷 Project Screenshots
### Here’s what the app looks like:

![App Screenshot](../tourist-safety/assets/Tourist_Dashboard.png)
![App Screenshot](../tourist-safety/assets/Tracking.png)
![App Screenshot](../tourist-safety/assets/Alert_APP.png)

### Admin Side  

![App Screenshot](../tourist-safety/assets/Admin_Dash.png)
![App Screenshot](../tourist-safety/assets/Alert_ADmin.png)
![App Screenshot](../tourist-safety/assets/E-FIR.png)
![App Screenshot](../tourist-safety/assets/SOS_Map.png)
![App Screenshot](../tourist-safety/assets/Polygon.png)

---

## 🔬 Research & References

* [Govt. of Assam — E-FIR Guidelines](https://police.assam.gov.in/how-to/e-fir)
* [Effect of Disasters on Indian Travel (Taylor & Francis)](https://www.taylorfrancis.com/chapters/edit/10.4324/9781003342090-46/effect-natural-disasters-north-eastern-region-india-%E2%80%94a-review-dipak-basumatari-nibir-borah-rajib-das-burnwal-eranki-sidhartha)
* [AI in Disaster Risk Management — ScienceDirect](https://www.sciencedirect.com/science/article/pii/S2212420923006039)
* [OpenStreetMap](https://www.openstreetmap.org/)
* [OpenMeteo API](https://open-meteo.com/en/docs)

---

## 🧑‍💻 Development Resources

* **GitHub Repository:** [https://github.com/Anoint2612/tourist-safety](https://github.com/Anoint2612/tourist-safety)
* **Demo Video:** [https://youtu.be/VNty5MsPQRE](https://youtu.be/VNty5MsPQRE)

---
