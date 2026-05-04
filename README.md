# Job Ops

自托管求职申请追踪工具，帮助管理求职进度。

## 功能特性

- 求职申请状态追踪
- 面试记录管理
- 数据统计分析
- 本地 SQLite 存储
- 中文界面

## 快速部署

```bash
docker run -d -p 3001:3001 -v $(pwd)/data:/app/data --name job-ops wsng911/job-ops:latest
```

访问 `http://localhost:3001`
