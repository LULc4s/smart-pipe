#!/usr/bin/env pwsh

Write-Host "Smart Pipe - Iniciando Backend e Frontend..." -ForegroundColor Green

concurrently `
  --names "BACKEND,FRONTEND" `
  --prefix "[{name}]" `
  --prefix-colors "blue,cyan" `
  "cd backend && npm run dev" `
  "cd frontend && npm run dev"
