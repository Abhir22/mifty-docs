---
sidebar_position: 2
title: Installation Guide
description: Complete step-by-step installation guide for Mifty CLI with prerequisites, verification, and troubleshooting.
keywords: [mifty, installation, nodejs, npm, setup, prerequisites]
---

import CommandBlock from '@site/src/components/CommandBlock';

# Installation Guide

Get Mifty up and running on your system with this comprehensive installation guide. We'll walk you through prerequisites, installation, verification, and troubleshooting.

## 📋 Prerequisites

Before installing Mifty, ensure your system meets these requirements:

### ✅ Required Dependencies

<div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', margin: '2rem 0'}}>

<div style={{padding: '1.5rem', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px', background: 'var(--ifm-color-emphasis-50)'}}>

#### 🟢 Node.js 16.x or Higher
**Required for running Mifty and TypeScript**

- **Download:** [nodejs.org](https://nodejs.org/)
- **Recommended:** Latest LTS version
- **Check version:** `node --version`

</div>

<div style={{padding: '1.5rem', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px', background: 'var(--ifm-color-emphasis-50)'}}>

#### 📦 npm 7.x or Higher
**Comes with Node.js, used for package management**

- **Included:** With Node.js installation
- **Alternative:** Yarn package manager
- **Check version:** `npm --version`

</div>

</div>

### 🔧 Optional but Recommended

<div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', margin: '2rem 0'}}>

<div style={{padding: '1.5rem', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px', background: 'var(--ifm-color-emphasis-50)'}}>

#### 🗄️ Database Setup
**Mifty uses PostgreSQL by default**

- **PostgreSQL:** Default database (recommended)
- **MySQL:** Alternative production database  
- **SQLite:** For quick prototyping (no setup required)
- **MongoDB:** For document-based apps

</div>

<div style={{padding: '1.5rem', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px', background: 'var(--ifm-color-emphasis-50)'}}>

#### 🔄 Git
**For version control and project management**

- **Download:** [git-scm.com](https://git-scm.com/)
- **Used for:** Project initialization and version control
- **Check version:** `git --version`

</div>

<div style={{padding: '1.5rem', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px', background: 'var(--ifm-color-emphasis-50)'}}>

#### 🐳 Docker (Optional)
**For containerized development**

- **Download:** [docker.com](https://www.docker.com/)
- **Used for:** Database containers, deployment
- **Check version:** `docker --version`

</div>

</div>

:::tip Beginner-Friendly
**New to backend development?** Mifty works perfectly with PostgreSQL by default. Use our Docker setup for quick development, or switch to SQLite for simple prototyping!
:::

## 🔍 System Check

Before installation, let's verify your system is ready:

<CommandBlock 
  command="# Check Node.js version (should be 16+)
node --version

# Check npm version (should be 7+)
npm --version

# Check if Git is installed (optional but recommended)
git --version"
  description="Run these commands to check your prerequisites"
/>

**Expected output:**
```
$ node --version
v18.17.0

$ npm --version
9.6.7

$ git --version
git version 2.40.1
```

:::warning Version Requirements
- **Node.js:** Must be 16.0.0 or higher
- **npm:** Must be 7.0.0 or higher
- If your versions are older, please update before proceeding
:::

## 🚀 Installation Methods

### Method 1: Global Installation (Recommended)

Install Mifty CLI globally to use it from anywhere on your system:

<CommandBlock 
  command="npm install -g @mifty/cli"
  description="Install Mifty CLI globally"
/>

**What this does:**
- ✅ Installs Mifty CLI commands globally
- ✅ Makes `mifty` command available system-wide
- ✅ Enables project creation from any directory
- ✅ Provides access to all Mifty tools

### Method 2: Using npx (Alternative)

If you prefer not to install globally, use npx:

<CommandBlock 
  command="npx @mifty/cli init my-project"
  description="Use Mifty without global installation"
/>

**When to use npx:**
- 🎯 One-time project creation
- 🔒 Restricted global installation permissions
- 🧪 Testing Mifty without permanent installation

### Method 3: Using Yarn

If you prefer Yarn package manager:

<CommandBlock 
  command="yarn global add @mifty/cli"
  description="Install Mifty CLI globally with Yarn"
/>

## ✅ Verify Installation

After installation, verify everything is working correctly:

<CommandBlock 
  command="# Check Mifty version
mifty --version

# View available commands
mifty --help"
  description="Verify your Mifty installation"
/>

**Expected output:**
```
$ mifty --version
@mifty/cli v1.0.4

$ mifty --help
Usage: mifty [command] [options]

Commands:
  init <project-name>  Create a new Mifty project
  --version           Show version number
  --help              Show help

Examples:
  mifty init my-blog-api    Create a new blog API project
  mifty init shop-backend   Create a new e-commerce backend
```

:::success Installation Complete!
If you see the version number and help text, Mifty is successfully installed! 🎉
:::

## 🛠️ Available Commands After Installation

Once installed, you have access to these commands:

<div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', margin: '2rem 0'}}>

<div style={{padding: '1.5rem', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px'}}>

#### Global Commands
```bash
mifty init <project-name>     # Create new project
mifty --version              # Show version
mifty --help                 # Show help
```

</div>

<div style={{padding: '1.5rem', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px'}}>

#### Project Commands (run from project directory)
```bash
npm run dev                  # Start API server
npm run dev:full            # Start full development suite
npm run db-designer         # Visual database designer
npm run generate            # Generate code from design
npm run adapter             # Manage adapters
```

</div>

</div>

## 🔧 Platform-Specific Instructions

### Windows

<CommandBlock 
  command="# Using Command Prompt
npm install -g @mifty/cli

# Using PowerShell (run as Administrator if needed)
npm install -g @mifty/cli

# Verify installation
mifty --version"
  description="Windows installation steps"
/>

**Windows-specific notes:**
- 🔒 May need to run Command Prompt as Administrator
- 🛡️ Windows Defender might scan the installation (normal)
- 📁 Global packages installed to: `%APPDATA%\npm\node_modules`

### macOS

<CommandBlock 
  command="# Using Terminal
npm install -g @mifty/cli

# If permission errors, use sudo (not recommended)
sudo npm install -g @mifty/cli

# Better: Fix npm permissions first
sudo chown -R $(whoami) ~/.npm

# Verify installation
mifty --version"
  description="macOS installation steps"
/>

**macOS-specific notes:**
- 🍎 Works on both Intel and Apple Silicon Macs
- 🔐 Avoid using `sudo` - fix npm permissions instead
- 🏠 Global packages installed to: `~/.npm-global`

### Linux (Ubuntu/Debian)

<CommandBlock 
  command="# Update package list
sudo apt update

# Install Node.js and npm (if not installed)
sudo apt install nodejs npm

# Install Mifty CLI
npm install -g @mifty/cli

# Verify installation
mifty --version"
  description="Linux installation steps"
/>

**Linux-specific notes:**
- 🐧 Works on all major Linux distributions
- 📦 May need to install Node.js from NodeSource for latest version
- 🔧 Consider using Node Version Manager (nvm) for Node.js management

## 🚨 Troubleshooting

### Common Installation Issues

#### Permission Errors

**Problem:** `EACCES` permission errors during global installation

<CommandBlock 
  command="# Fix npm permissions (recommended)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Then install Mifty
npm install -g @mifty/cli"
  description="Fix npm permission issues"
/>

#### Command Not Found

**Problem:** `mifty: command not found` after installation

<CommandBlock 
  command="# Check if npm global bin is in PATH
npm config get prefix

# Add to PATH (replace with your npm prefix)
echo 'export PATH=/usr/local/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Verify PATH includes npm global bin
echo $PATH"
  description="Fix PATH issues"
/>

#### Network/Proxy Issues

**Problem:** Installation fails due to network or proxy issues

<CommandBlock 
  command="# Clear npm cache
npm cache clean --force

# Set registry (if behind corporate firewall)
npm config set registry https://registry.npmjs.org/

# Install with verbose logging
npm install -g @mifty/cli --verbose"
  description="Fix network-related installation issues"
/>

#### Version Conflicts

**Problem:** Conflicting versions or corrupted installation

<CommandBlock 
  command="# Uninstall existing version
npm uninstall -g @mifty/cli

# Clear npm cache
npm cache clean --force

# Reinstall latest version
npm install -g @mifty/cli@latest

# Verify installation
mifty --version"
  description="Fix version conflicts"
/>

### Platform-Specific Issues

#### Windows: PowerShell Execution Policy

**Problem:** PowerShell blocks script execution

<CommandBlock 
  command="# Check current execution policy
Get-ExecutionPolicy

# Set execution policy (run PowerShell as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Verify Mifty works
mifty --version"
  description="Fix PowerShell execution policy on Windows"
/>

#### macOS: Gatekeeper Issues

**Problem:** macOS blocks unsigned binaries

<CommandBlock 
  command="# Allow unsigned binaries (if needed)
sudo spctl --master-disable

# Or allow specific app through System Preferences > Security & Privacy

# Verify Mifty works
mifty --version"
  description="Fix macOS Gatekeeper issues"
/>

### Getting Help

If you're still experiencing issues:

1. **📖 Check our [Troubleshooting Guide](../troubleshooting/)**
2. **🐛 Report issues on [GitHub Issues](https://github.com/abhir22/miftyjs/issues)**
3. **💬 Join our community discussions**
4. **📧 Contact support with detailed error messages**

## 🎯 What Gets Installed

Understanding what Mifty installs on your system:

### Global Installation
- **CLI commands:** `mifty`, `mifty-generate`, `mifty-db-designer`, etc.
- **Framework tools:** Templates, generators, development servers
- **Location:** Global npm modules directory

### Project Creation
- **Essential files:** Project structure, configuration files
- **Dependencies:** Adds `@mifty/cli` as devDependency
- **Tools access:** Via npm scripts that call global commands

**Result:** Lightweight projects with full framework power! 🚀

## ✅ Installation Complete

Congratulations! Mifty is now installed and ready to use. Here's what you can do next:

<div style={{display: 'flex', gap: '1rem', margin: '2rem 0', flexWrap: 'wrap'}}>

<a href="./quick-start" style={{
  padding: '1rem 2rem',
  background: 'var(--ifm-color-primary)',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '8px',
  fontWeight: 'bold',
  display: 'inline-block'
}}>
⚡ Quick Start Guide
</a>

<a href="../framework/" style={{
  padding: '1rem 2rem',
  border: '2px solid var(--ifm-color-primary)',
  color: 'var(--ifm-color-primary)',
  textDecoration: 'none',
  borderRadius: '8px',
  fontWeight: 'bold',
  display: 'inline-block'
}}>
📚 Framework Guide
</a>

</div>

### Next Steps

1. **[Quick Start](./quick-start)** - Create your first project in 2 minutes
2. **[Database Design](../database/visual-designer)** - Learn the visual designer
3. **[Code Generation](../framework/code-generation)** - Understand auto-generation
4. **[Adapters](../adapters/)** - Add third-party integrations

:::tip Pro Tip
Run `mifty init my-first-api` to create your first project and start exploring Mifty's capabilities!
:::