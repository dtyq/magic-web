#!/bin/bash

# 检测系统默认语言 / Detect system default language
detect_language() {
  # 默认使用英文 / Default to English
  DEFAULT_LANG="en"
  
  # 获取系统语言设置 / Get system language settings
  if [[ "$(uname -s)" == "Darwin" ]]; then
    # macOS 系统 / macOS system
    SYS_LANG=$(defaults read -g AppleLocale 2>/dev/null || echo "en_US")
  else
    # Linux 和其他系统 / Linux and other systems
    SYS_LANG=$(echo $LANG || echo $LC_ALL || echo $LC_MESSAGES || echo "en_US.UTF-8")
  fi
  
  # 如果语言代码以 zh_ 开头，设置为中文，否则使用英文
  # If language code starts with zh_, set to Chinese, otherwise use English
  if [[ $SYS_LANG == zh_* ]]; then
    DEFAULT_LANG="zh"
  fi
  
  echo $DEFAULT_LANG
}

# 获取系统语言 / Get system language
SYSTEM_LANG=$(detect_language)

# 双语提示函数 / Bilingual prompt function
# 用法: bilingual "中文消息" "English message"
# Usage: bilingual "Chinese message" "English message"
bilingual() {
  if [[ "$SYSTEM_LANG" == "zh" ]]; then
    echo "$1 | $2"
  else
    echo "$2 | $1"
  fi
}

# 检查是否安装了 Docker / Check if Docker is installed
if ! command -v docker &> /dev/null; then
    bilingual "错误: Docker 未安装。" "Error: Docker is not installed."
    bilingual "请先安装 Docker:" "Please install Docker first:"
    if [ "$(uname -s)" == "Darwin" ]; then
        bilingual "1. 访问 https://docs.docker.com/desktop/install/mac-install/" "1. Visit https://docs.docker.com/desktop/install/mac-install/"
        bilingual "2. 下载并安装 Docker Desktop for Mac" "2. Download and install Docker Desktop for Mac"
    elif [ "$(uname -s)" == "Linux" ]; then
        bilingual "1. 访问 https://docs.docker.com/engine/install/" "1. Visit https://docs.docker.com/engine/install/"
        bilingual "2. 按照您的 Linux 发行版安装说明进行操作" "2. Follow the installation instructions for your Linux distribution"
    else
        bilingual "请访问 https://docs.docker.com/get-docker/ 获取安装指南" "Please visit https://docs.docker.com/get-docker/ for installation instructions"
    fi
    exit 1
fi

# 检查 Docker 是否正在运行 / Check if Docker is running
if ! docker info &> /dev/null; then
    bilingual "错误: Docker 未运行。" "Error: Docker is not running."
    bilingual "请启动 Docker 并重试。" "Please start Docker and try again."
    if [ "$(uname -s)" == "Darwin" ]; then
        bilingual "1. 打开 Docker Desktop" "1. Open Docker Desktop"
        bilingual "2. 等待 Docker 启动" "2. Wait for Docker to start"
    elif [ "$(uname -s)" == "Linux" ]; then
        bilingual "1. 启动 Docker 服务: sudo systemctl start docker" "1. Start Docker service: sudo systemctl start docker"
    fi
    exit 1
fi

# 检查是否安装了 docker-compose / Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    bilingual "错误: docker-compose 未安装。" "Error: docker-compose is not installed."
    bilingual "请先安装 docker-compose:" "Please install docker-compose first:"
    if [ "$(uname -s)" == "Darwin" ]; then
        bilingual "1. Docker Desktop for Mac 默认包含 docker-compose" "1. Docker Desktop for Mac includes docker-compose by default"
        bilingual "2. 如果您使用的是旧版本，请访问 https://docs.docker.com/compose/install/" "2. If you're using an older version, visit https://docs.docker.com/compose/install/"
    elif [ "$(uname -s)" == "Linux" ]; then
        bilingual "1. 访问 https://docs.docker.com/compose/install/" "1. Visit https://docs.docker.com/compose/install/"
        bilingual "2. 按照您的 Linux 发行版安装说明进行操作" "2. Follow the installation instructions for your Linux distribution"
        bilingual "   例如，在 Ubuntu/Debian 上:" "   For example, on Ubuntu/Debian:"
        echo "   sudo apt-get update"
        echo "   sudo apt-get install docker-compose-plugin"
    else
        bilingual "请访问 https://docs.docker.com/compose/install/ 获取安装指南" "Please visit https://docs.docker.com/compose/install/ for installation instructions"
    fi
    exit 1
fi

# 检测系统架构 / Detect system architecture
ARCH=$(uname -m)
case $ARCH in
    x86_64)
        export PLATFORM=linux/amd64
        ;;
    aarch64|arm64|armv7l)
        export PLATFORM=linux/arm64
        ;;
    *)
        bilingual "不支持的架构: $ARCH" "Unsupported architecture: $ARCH"
        exit 1
        ;;
esac

# 如果是 macOS arm64 则不设置 PLATFORM / Do not set PLATFORM if using macOS arm64
if [ "$(uname -s)" == "Darwin" ] && [ "$(uname -m)" == "arm64" ]; then
    export PLATFORM=""
fi

bilingual "检测到架构: $ARCH，使用平台: $PLATFORM" "Detected architecture: $ARCH, using platform: $PLATFORM"

# 判断 .env 是否存在，如果不存在复制 .env.example 到 .env
# Check if .env exists, if not copy .env.example to .env
if [ ! -f .env ]; then
    cp .env.example .env
fi

# 修改 .env 的 PLATFORM 变量 / Modify PLATFORM variable in .env
if [ -n "$PLATFORM" ]; then
    if [ "$(uname -s)" == "Darwin" ]; then
        # macOS 版本 / macOS version
        sed -i '' "s/^PLATFORM=.*/PLATFORM=$PLATFORM/" .env
    else
        # Linux 版本 / Linux version
        sed -i "s/^PLATFORM=.*/PLATFORM=$PLATFORM/" .env
    fi
else
    # 如果 PLATFORM 为空，将其设置为空字符串 / If PLATFORM is empty, set it to an empty string
    if [ "$(uname -s)" == "Darwin" ]; then
        sed -i '' "s/^PLATFORM=.*/PLATFORM=/" .env
    else
        sed -i "s/^PLATFORM=.*/PLATFORM=/" .env
    fi
fi

# 检测公网IP并更新环境变量 / Detect public IP and update environment variables
detect_public_ip() {
    # 询问用户部署方式 / Ask user about deployment method
    bilingual "请选择您的部署方式:" "Please select your deployment method:"
    bilingual "1. 本地电脑部署" "1. Local deployment"
    bilingual "2. 远程服务器部署" "2. Remote server deployment"
    read -p "$(bilingual "请输入选项编号 [1/2]: " "Please enter option number [1/2]: ")" DEPLOYMENT_TYPE
    
    # 如果用户选择本地部署，则不进行IP更新
    # If user chooses local deployment, do not update IP
    if [ "$DEPLOYMENT_TYPE" = "1" ]; then
        bilingual "已选择本地部署，保持默认设置。" "Local deployment selected, keeping default settings."
        return 0
    elif [ "$DEPLOYMENT_TYPE" != "2" ]; then
        bilingual "无效的选项，默认使用本地部署。" "Invalid option, using local deployment by default."
        return 0
    fi
    
    bilingual "正在检测公网IP..." "Detecting public IP..."
    
    # 尝试多种方法获取公网IP / Try multiple methods to get public IP
    PUBLIC_IP=""
    
    # 方法1: 使用ipinfo.io / Method 1: Using ipinfo.io
    if [ -z "$PUBLIC_IP" ]; then
        PUBLIC_IP=$(curl -s https://ipinfo.io/ip 2>/dev/null)
        if [ -z "$PUBLIC_IP" ] || [[ $PUBLIC_IP == *"html"* ]]; then
            PUBLIC_IP=""
        fi
    fi
    
    # 方法2: 使用ip.sb / Method 2: Using ip.sb
    if [ -z "$PUBLIC_IP" ]; then
        PUBLIC_IP=$(curl -s https://api.ip.sb/ip 2>/dev/null)
        if [ -z "$PUBLIC_IP" ] || [[ $PUBLIC_IP == *"html"* ]]; then
            PUBLIC_IP=""
        fi
    fi
    
    # 方法3: 使用ipify / Method 3: Using ipify
    if [ -z "$PUBLIC_IP" ]; then
        PUBLIC_IP=$(curl -s https://api.ipify.org 2>/dev/null)
        if [ -z "$PUBLIC_IP" ] || [[ $PUBLIC_IP == *"html"* ]]; then
            PUBLIC_IP=""
        fi
    fi
    
    # 如果成功获取公网IP，询问用户是否使用此IP
    # If successfully obtained public IP, ask user whether to use this IP
    if [ -n "$PUBLIC_IP" ]; then
        bilingual "检测到公网IP: $PUBLIC_IP" "Detected public IP: $PUBLIC_IP"
        bilingual "是否使用此IP更新配置?" "Do you want to use this IP for configuration?"
        read -p "$(bilingual "请输入 [y/n]: " "Please enter [y/n]: ")" USE_DETECTED_IP
        
        if [[ "$USE_DETECTED_IP" =~ ^[Yy]$ ]]; then
            bilingual "正在更新环境变量..." "Updating environment variables..."
            
            # 更新MAGIC_SOCKET_BASE_URL和MAGIC_SERVICE_BASE_URL
            # Update MAGIC_SOCKET_BASE_URL and MAGIC_SERVICE_BASE_URL
            if [ "$(uname -s)" == "Darwin" ]; then
                # macOS版本 / macOS version
                sed -i '' "s|^MAGIC_SOCKET_BASE_URL=ws://localhost:9502|MAGIC_SOCKET_BASE_URL=ws://$PUBLIC_IP:9502|" .env
                sed -i '' "s|^MAGIC_SERVICE_BASE_URL=http://localhost:9501|MAGIC_SERVICE_BASE_URL=http://$PUBLIC_IP:9501|" .env
            else
                # Linux版本 / Linux version
                sed -i "s|^MAGIC_SOCKET_BASE_URL=ws://localhost:9502|MAGIC_SOCKET_BASE_URL=ws://$PUBLIC_IP:9502|" .env
                sed -i "s|^MAGIC_SERVICE_BASE_URL=http://localhost:9501|MAGIC_SERVICE_BASE_URL=http://$PUBLIC_IP:9501|" .env
            fi
            
            bilingual "环境变量已更新:" "Environment variables updated:"
            echo "MAGIC_SOCKET_BASE_URL=ws://$PUBLIC_IP:9502"
            echo "MAGIC_SERVICE_BASE_URL=http://$PUBLIC_IP:9501"
        else
            bilingual "保持默认设置。" "Keeping default settings."
        fi
    else
        bilingual "未能检测到公网IP。" "Failed to detect public IP."
        bilingual "是否手动输入IP地址?" "Do you want to manually enter an IP address?"
        read -p "$(bilingual "请输入 [y/n]: " "Please enter [y/n]: ")" MANUAL_IP
        
        if [[ "$MANUAL_IP" =~ ^[Yy]$ ]]; then
            read -p "$(bilingual "请输入IP地址: " "Please enter IP address: ")" MANUAL_IP_ADDRESS
            
            if [ -n "$MANUAL_IP_ADDRESS" ]; then
                bilingual "正在使用IP: $MANUAL_IP_ADDRESS 更新环境变量..." "Updating environment variables with IP: $MANUAL_IP_ADDRESS..."
                
                # 更新MAGIC_SOCKET_BASE_URL和MAGIC_SERVICE_BASE_URL
                # Update MAGIC_SOCKET_BASE_URL and MAGIC_SERVICE_BASE_URL
                if [ "$(uname -s)" == "Darwin" ]; then
                    # macOS版本 / macOS version
                    sed -i '' "s|^MAGIC_SOCKET_BASE_URL=ws://localhost:9502|MAGIC_SOCKET_BASE_URL=ws://$MANUAL_IP_ADDRESS:9502|" .env
                    sed -i '' "s|^MAGIC_SERVICE_BASE_URL=http://localhost:9501|MAGIC_SERVICE_BASE_URL=http://$MANUAL_IP_ADDRESS:9501|" .env
                else
                    # Linux版本 / Linux version
                    sed -i "s|^MAGIC_SOCKET_BASE_URL=ws://localhost:9502|MAGIC_SOCKET_BASE_URL=ws://$MANUAL_IP_ADDRESS:9502|" .env
                    sed -i "s|^MAGIC_SERVICE_BASE_URL=http://localhost:9501|MAGIC_SERVICE_BASE_URL=http://$MANUAL_IP_ADDRESS:9501|" .env
                fi
                
                bilingual "环境变量已更新:" "Environment variables updated:"
                echo "MAGIC_SOCKET_BASE_URL=ws://$MANUAL_IP_ADDRESS:9502"
                echo "MAGIC_SERVICE_BASE_URL=http://$MANUAL_IP_ADDRESS:9501"
            else
                bilingual "IP地址为空，保持默认设置。" "IP address is empty, keeping default settings."
            fi
        else
            bilingual "保持默认设置。" "Keeping default settings."
        fi
    fi
}

# 运行IP检测和更新 / Run IP detection and update
detect_public_ip

# 检查Super Magic环境配置文件是否存在 / Check if Super Magic environment file exists
check_super_magic_env() {
    if [ ! -f .env_super_magic ]; then
        if [ -f .env_super_magic.example ]; then
            bilingual "错误：.env_super_magic 文件不存在！" "Error: .env_super_magic file does not exist!"
            bilingual "请按照以下步骤进行操作：" "Please follow these steps:"
            bilingual "1. 复制示例配置文件：cp .env_super_magic.example .env_super_magic" "1. Copy the example configuration file: cp .env_super_magic.example .env_super_magic"
            bilingual "2. 编辑配置文件：vim .env_super_magic（或使用您喜欢的编辑器）" "2. Edit the configuration file: vim .env_super_magic (or use your preferred editor)"
            bilingual "3. 配置所有必要的环境变量" "3. Configure all necessary environment variables"
            bilingual "4. 再次运行此脚本" "4. Run this script again"
            return 1
        else
            bilingual "错误：.env_super_magic 和 .env_super_magic.example 文件都不存在！" "Error: Both .env_super_magic and .env_super_magic.example files do not exist!"
            bilingual "请联系系统管理员获取正确的配置文件。" "Please contact your system administrator for the correct configuration files."
            return 1
        fi
    fi
    return 0
}

# 询问是否安装Super Magic服务 / Ask if Super Magic service should be installed
ask_super_magic() {
    bilingual "是否安装Super Magic服务?" "Do you want to install Super Magic service?"
    bilingual "1. 是，安装Super Magic服务" "1. Yes, install Super Magic service"
    bilingual "2. 否，不安装Super Magic服务" "2. No, don't install Super Magic service"
    read -p "$(bilingual "请输入选项编号 [1/2]: " "Please enter option number [1/2]: ")" SUPER_MAGIC_OPTION
    
    if [ "$SUPER_MAGIC_OPTION" = "1" ]; then
        bilingual "您选择了安装Super Magic服务。" "You have chosen to install Super Magic service."
        
        # 检查.env_super_magic文件是否存在
        # Check if .env_super_magic exists
        if ! check_super_magic_env; then
            exit 1
        fi
        
        # 在docker-compose命令中添加super-magic配置文件
        # Add super-magic profile to docker-compose commands
        export MAGIC_USE_SUPER_MAGIC="--profile super-magic"
        bilingual "Super Magic服务将被启动。" "Super Magic service will be started."
    else
        bilingual "您选择了不安装Super Magic服务。" "You have chosen not to install Super Magic service."
        export MAGIC_USE_SUPER_MAGIC=""
    fi
}

# 运行Super Magic安装询问 / Run Super Magic installation inquiry
ask_super_magic

# 显示帮助信息 / Show help information
show_help() {
    bilingual "用法: $0 [命令]" "Usage: $0 [command]"
    echo ""
    bilingual "命令:" "Commands:"
    bilingual "  start             启动服务(前台)" "  start             Start services in foreground"
    bilingual "  stop              停止所有服务" "  stop              Stop all services"
    bilingual "  daemon            后台启动服务" "  daemon            Start services in background"
    bilingual "  restart           重启所有服务" "  restart           Restart all services"
    bilingual "  status            显示服务状态" "  status            Show services status"
    bilingual "  logs              显示服务日志" "  logs              Show services logs"
    bilingual "  super-magic       仅启动Super Magic服务(前台)" "  super-magic       Start only Super Magic service (foreground)"
    bilingual "  super-magic-daemon 仅启动Super Magic服务(后台)" "  super-magic-daemon Start only Super Magic service (background)"
    echo ""
    bilingual "如果未提供命令，默认使用 'start'" "If no command is provided, 'start' will be used by default."
}

# 启动服务 / Start services
start_services() {
    bilingual "正在前台启动服务..." "Starting services in foreground..."
    docker-compose $MAGIC_USE_SUPER_MAGIC up
}

# 停止服务 / Stop services
stop_services() {
    bilingual "正在停止服务..." "Stopping services..."
    docker-compose $MAGIC_USE_SUPER_MAGIC down
}

# 后台启动服务 / Start services in background
start_daemon() {
    bilingual "正在后台启动服务..." "Starting services in background..."
    docker-compose $MAGIC_USE_SUPER_MAGIC up -d
}

# 重启服务 / Restart services
restart_services() {
    bilingual "正在重启服务..." "Restarting services..."
    docker-compose $MAGIC_USE_SUPER_MAGIC restart
}

# 查看服务状态 / Show services status
show_status() {
    bilingual "服务状态:" "Services status:"
    docker-compose $MAGIC_USE_SUPER_MAGIC ps
}

# 查看服务日志 / Show services logs
show_logs() {
    bilingual "显示服务日志:" "Showing services logs:"
    docker-compose $MAGIC_USE_SUPER_MAGIC logs -f
}

# 仅启动Super Magic服务 / Start only Super Magic service
start_super_magic() {
    # 检查.env_super_magic文件是否存在
    # Check if .env_super_magic exists
    if ! check_super_magic_env; then
        exit 1
    fi

    bilingual "正在前台启动Super Magic服务..." "Starting Super Magic service in foreground..."
    docker-compose --profile super-magic up
}

# 后台仅启动Super Magic服务 / Start only Super Magic service in background
start_super_magic_daemon() {
    # 检查.env_super_magic文件是否存在
    # Check if .env_super_magic exists
    if ! check_super_magic_env; then
        exit 1
    fi

    bilingual "正在后台启动Super Magic服务..." "Starting Super Magic service in background..."
    docker-compose --profile super-magic up -d
}

# 处理命令行参数 / Handle command line arguments
case "$1" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    daemon)
        start_daemon
        ;;
    restart)
        restart_services
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    super-magic)
        start_super_magic
        ;;
    super-magic-daemon)
        start_super_magic_daemon
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        if [ -z "$1" ]; then
            start_services
        else
            bilingual "未知命令: $1" "Unknown command: $1"
            show_help
            exit 1
        fi
        ;;
esac 
