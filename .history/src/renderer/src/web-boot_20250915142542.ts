// 提前初始化日志与 Web 环境，以免早期模块访问 LoggerService 报错
import { loggerService } from '@logger'
;(window as any).IS_WEB = true
import './electron-web-shims'
loggerService.initWindowSource('web')


