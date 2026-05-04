# job-ops Prompts

> 项目：DaKheera47/job-ops
> 技术栈：React + Vite + TypeScript 前端，Node.js + Express 后端，SQLite 本地存储，求职申请追踪

---

## 功能迭代

**1. 添加求职申请看板视图**
在 job-ops 中添加看板（Kanban）视图，将求职申请按状态（待投递/已投递/面试中/已录用/已拒绝）分列显示，支持拖拽卡片在列间移动以更新状态，与现有列表视图可切换。

**2. 支持面试日程提醒**
在 job-ops 中为面试安排添加日历提醒功能。用户可以为每次面试设置提醒时间，通过浏览器 Notification API 在指定时间前发送桌面通知，提醒信息包含公司名称、职位和面试时间。

**3. 添加求职数据统计仪表盘**
在 job-ops 中添加统计仪表盘，展示：总申请数、各状态分布饼图、每周投递趋势折线图、平均响应时间、面试转化率等关键指标，帮助用户分析求职效率。

**4. 支持简历版本管理**
在 job-ops 中添加简历版本管理功能。用户可以上传多个版本的简历（PDF），为每个求职申请关联使用的简历版本，方便追踪不同简历的投递效果。

**5. 添加公司信息自动抓取**
在 job-ops 中，当用户输入职位链接时，自动抓取公司名称、职位描述、薪资范围等信息并填充到表单中，减少手动输入。支持主流招聘平台（LinkedIn、Indeed、Boss直聘等）。

---

## Bug 修复

**6. 修复申请状态更新后列表不刷新**
在 job-ops 中，更新求职申请状态后，列表页面有时不会立即反映最新状态，需要手动刷新页面。请检查状态更新后的数据重新获取逻辑，确保 UI 与数据库状态保持同步。

**7. 修复日期筛选器时区问题**
在 job-ops 中，使用日期筛选器过滤申请时，由于时区处理不一致，部分申请会出现在错误的日期范围内。请统一使用本地时区进行日期比较，避免 UTC 与本地时间的混淆。

**8. 修复大量申请时搜索性能下降**
在 job-ops 中，当申请数量超过 500 条时，搜索功能响应明显变慢。请为搜索添加防抖处理（300ms），并考虑将搜索逻辑移到后端，利用 SQLite 的 LIKE 查询提升性能。

**9. 修复申请备注中换行符丢失**
在 job-ops 中，在申请备注中输入多行文本后保存，重新打开时换行符丢失，所有内容显示在一行。请检查备注字段的存储和读取逻辑，确保换行符被正确保留。

**10. 修复导出 CSV 时特殊字符导致格式错误**
在 job-ops 中，将申请数据导出为 CSV 时，如果字段内容包含逗号或引号，会导致 CSV 格式错误。请对所有字段值进行正确的 CSV 转义处理（用双引号包裹含特殊字符的字段）。

---

## 重构

**11. 将数据库操作封装为 Repository 层**
job-ops 的后端中，SQLite 查询直接写在路由处理函数中，缺乏抽象。请创建 `src/server/repositories/` 目录，将各实体（Application、Company、Interview）的数据库操作封装为独立的 Repository 类。

**12. 统一前端 API 请求错误处理**
job-ops 前端各组件直接调用 fetch/axios，错误处理方式不统一。请创建统一的 API 客户端，集中处理网络错误、HTTP 错误状态码，并通过 toast 通知统一展示错误信息。

---

## 测试

**13. 为申请 CRUD API 编写集成测试**
使用 Vitest + Supertest 为 job-ops 的申请管理 API 编写集成测试，覆盖：创建申请、获取申请列表（分页/筛选）、更新申请状态、删除申请。使用内存 SQLite 数据库隔离测试。

**14. 为申请状态机编写单元测试**
为 job-ops 的申请状态转换逻辑编写单元测试，覆盖：合法的状态转换（待投递→已投递→面试中→录用/拒绝）、非法状态转换的错误处理、状态变更时间戳的自动更新。

**15. 为前端申请列表组件编写测试**
使用 React Testing Library 为 job-ops 的申请列表组件编写测试，覆盖：列表渲染、按状态筛选、按公司名搜索、排序功能（按日期/公司名）、分页导航。

---

## 代码理解

**16. 解释 job-ops 的数据模型设计**
在 job-ops 中，SQLite 数据库的表结构是怎样的？Application、Company、Interview 之间的关联关系是什么？如何处理一个公司多个职位申请的情况？数据库迁移是如何管理的？

**17. 解释 job-ops 的 monorepo 架构**
在 job-ops 中，orchestrator、extractors、shared 等包是如何组织的？npm workspaces 如何管理包间依赖？extractors 包的作用是什么？如何添加一个新的招聘平台 extractor？

---

## DevOps

**18. 编写 GitHub Actions 自动构建流水线**
为 job-ops 编写 `.github/workflows/docker-build.yml`，实现推送 main 分支时自动构建 Docker 镜像并推送到 Docker Hub，使用 npm workspaces 缓存加速构建。

**19. 编写 docker-compose.yml 部署配置**
为 job-ops 编写 `docker-compose.yml`，包含：job-ops 服务（映射 3001 端口）、数据目录挂载（`./data:/app/data`）、环境变量配置（端口、数据目录）、健康检查、自动重启策略。

**20. 编写数据备份脚本**
为 job-ops 编写自动备份脚本，定期备份 SQLite 数据库文件（`/app/data/*.db`），保留最近 7 天的备份，支持通过环境变量配置备份目录，并在备份完成后输出文件大小和时间戳。

---

## 构建与截图命令

**构建截图：**
```bash
cd /path/to/job-ops && docker build -t job-ops-test .
```

**网页截图：**
```bash
docker run -d -p 3001:3001 --name job-ops-test job-ops-test && sleep 3 && open http://localhost:3001
```

**清理：**
```bash
docker rm -f job-ops-test && docker rmi job-ops-test
```
