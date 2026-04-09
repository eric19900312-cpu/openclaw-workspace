# SQL Server 学习笔记

## 2026-03-02

### 技能安装
- 安装了 `sql-server-toolkit` 技能（来自 ClawHub）
- 支持：Schema 创建、版本化迁移、索引管理、性能诊断、备份/恢复、批量导入导出

---

### Job 超时处理

**需求**：执行存储过程 `[dbo].[usp_Cal_Customer_LeaderGrade]`，如果超过 110 分钟需要终止，配置到 SQL Server 作业里，每2小时执行一次。

**方案**：SQL Server Agent Job 本身不支持内置超时，用以下曲线救国方案：

#### 方案1：PowerShell + Task Scheduler（推荐）
- 用 PowerShell 的 `Invoke-Sqlcmd -QueryTimeout 6600` 控制超时
- 通过 Windows 计划任务每2小时执行

#### 方案2：SQL Job 曲线救国
- 创建两个 Job：异步执行 Job + 监控 Job
- 或单个 Job 内用 `WAITFOR DELAY` + `sp_stop_job`

---

### 实用查询

**查询 Job 是否在运行**：
```sql
SELECT j.name, a.*
FROM msdb.dbo.sysjobactivity a
INNER JOIN msdb.dbo.sysjobs j ON a.job_id = j.job_id
WHERE j.name = N'120minplan'
AND a.run_requested_date IS NOT NULL 
AND a.stop_execution_date IS NULL
AND a.run_requested_date > DATEADD(HOUR, -24, GETDATE());
```

**判断是否正在运行（简洁版）**：
```sql
SELECT CASE WHEN EXISTS (
    SELECT 1 FROM msdb.dbo.sysjobactivity a
    INNER JOIN msdb.dbo.sysjobs j ON a.job_id = j.job_id
    WHERE j.name = N'作业名称'
    AND a.run_requested_date IS NOT NULL 
    AND a.stop_execution_date IS NULL
) THEN '🔴 正在运行' ELSE '✅ 没在运行' END;
```

**停止 Job**：
```sql
EXEC msdb.dbo.sp_stop_job @job_name = N'作业名称';
```

**Kill SPID（强制终止）**：
```sql
-- 先找到 session_id
DECLARE @session_id INT;
SELECT @session_id = a.session_id
FROM msdb.dbo.sysjobactivity a
INNER JOIN msdb.dbo.sysjobs j ON a.job_id = j.job_id
WHERE j.name = N'作业名称'
AND a.run_requested_date IS NOT NULL 
AND a.stop_execution_date IS NULL;

-- Kill SPID
IF @session_id IS NOT NULL
    KILL @session_id;
```

**查看当前活跃 SPID**：
```sql
SELECT spid, status, program_name, cmd, login_time
FROM master..sysprocesses
WHERE spid > 50
AND status IN ('runnable', 'running', 'suspended')
ORDER BY login_time DESC;
```

---

### 注意事项
- `sysjobactivity` 表会残留历史记录，即使 Job 已结束也可能显示"在运行"
- 需要加时间筛选：`AND a.run_requested_date > DATEADD(HOUR, -24, GETDATE())`
- 或者用 `session_id` + `TOP 1 ORDER BY` 取最新记录

---

### 待测试
- Job 监控超时并自动终止的完整方案
