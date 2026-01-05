# Gas Price Reporting Application

A location-based, crowd-sourced gas price reporting system built as a **full-stack engineering practice project**.

This project focuses on **backend API design**, **database modeling**, and **frontend–backend integration** in a realistic development setup. It is intended as a learning and demonstration project rather than a production-ready product.

---

## Table of Contents

1. [Project Summary](#project-summary)  
2. [Repository Structure](#repository-structure)  
3. [System Architecture and Technology Stack](#system-architecture-and-technology-stack)  
   - [Backend Service](#backend-service)  
   - [Web Frontend](#web-frontend)  
   - [WeChat Mini Program](#wechat-mini-program)  
4. [API Overview](#api-overview)  
5. [Local Development](#local-development)  
6. [Scope and Design Decisions](#scope-and-design-decisions)  
7. [Project Summary (Revisited)](#project-summary-revisited)

---

## Project Summary

The application allows users to:

- Discover nearby gas stations based on geographic location  
- View recently reported gas prices  
- Submit new gas price reports  
- Access the system through both mobile and web clients  

The system consists of a single backend API and multiple frontend clients, all communicating through RESTful interfaces.

---

## Repository Structure

.
├── backend            # NestJS backend service  
│   ├── prisma         # Prisma schema definition  
│   └── src            # Application source code  
│  
├── web                # Web frontend (React + TypeScript)  
│  
├── wcminiapp          # WeChat Mini Program frontend  
│  
├── docker-compose.yml # Local service orchestration  
└── README.md  

The repository is organized as a monorepo, with clear separation between backend and frontend responsibilities.

---

## System Architecture and Technology Stack

### Backend Service

- Node.js  
- TypeScript  
- NestJS  
- Prisma ORM  
- PostgreSQL  
- Docker / Docker Compose  

**Architecture Overview**

The backend follows a feature-based modular architecture implemented with NestJS.

Core modules include:

- **stations** — nearby station queries and station detail retrieval  
- **reports** — gas price report submission and retrieval  
- **prices** — pricing configuration, validation, and aggregation logic  
- **health** — service health check endpoint  
- **version** — API version information  

Shared utilities (`shared/utils`) provide:

- Geospatial distance calculation  
- Price outlier detection  
- Simple rate-limiting helpers  
- DTO-to-response model mapping  

Design principles:

- Stateless REST API  
- Explicit DTO definitions for request and response  
- Database models are not exposed directly to clients  

---

### Web Frontend

- React  
- TypeScript  
- Vite  
- Leaflet (map rendering)  

**Responsibilities**

- Interactive map view  
- Nearby station listing  
- Station detail pages with recent prices  
- Gas price reporting flow  

**Design Notes**

- Page-level components separated from view components  
- Centralized API service layer  
- ViewModels used to adapt API responses for UI rendering  

---

### WeChat Mini Program

- WeChat Mini Program platform  
- JavaScript / WXML / WXSS  

**Responsibilities**

- Location-based nearby station discovery  
- Gas price reporting workflow  
- Station detail view  
- Custom price stepper component  

**Design Notes**

- Page-based structure following Mini Program conventions  
- Shared utility modules for API access, location, and formatting  
- Clear separation between UI logic and data access  

---

## API Overview

The backend exposes a RESTful API consumed by all frontend clients.

Typical endpoints include:

- `GET /stations`  
  Retrieve nearby gas stations based on location parameters.

- `GET /stations/:id`  
  Retrieve station details and recent prices.

- `POST /reports`  
  Submit a new gas price report.

- `GET /health`  
  Health check endpoint.

Responses are designed to be consistent across clients.

---

## Local Development

### Prerequisites

- Docker  
- Docker Compose  

### Start Services

docker-compose up --build

This command starts:

- PostgreSQL database  
- Backend API service  

Frontend applications can be started independently using their respective tooling.

---

## Scope and Design Decisions

To keep the project focused, the following features are intentionally out of scope:

- User authentication and authorization  
- Payment systems or monetization  
- Recommendation algorithms  
- Administrative dashboards  

The emphasis is on engineering fundamentals rather than product completeness.

---

## Project Summary (Revisited)

This project demonstrates:

- Practical backend development using NestJS  
- Clean REST API and DTO design  
- Relational data modeling with Prisma  
- Frontend–backend integration across multiple clients  
- Realistic local development using Docker  

It is designed as a learning and portfolio project to showcase full-stack engineering capabilities.