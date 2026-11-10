# Role Permissions & Access Control

This document explains what each user role can and cannot do in simple words.

---

## 1. The 4 User Roles

```
1. SUPER ADMIN  ---> Manages the whole SaaS platform & customer companies.
       │
       ▼
2. ADMIN        ---> Manages their own company, employees, teams, and settings.
       │
       ▼
3. MANAGER      ---> Manages their own sales team, leads, and follow-ups.
       │
       ▼
4. EMPLOYEE     ---> Works on their own assigned sales leads and tasks.
```

---

## 2. Role Permissions Table

| Feature / Action | Super Admin | Admin | Manager | Employee |
| :--- | :---: | :---: | :---: | :---: |
| **Companies** | | | | |
| Create new company workspace | **YES** | NO | NO | NO |
| Suspend or reactivate company | **YES** | NO | NO | NO |
| Edit company name, currency, timezone | NO | **YES** | NO | NO |
| **Employees & Teams** | | | | |
| Add new employee account | NO | **YES** | NO | NO |
| Change an employee's role | NO | **YES** | NO | NO |
| Deactivate an employee | NO | **YES** | NO | NO |
| Create a sales team | NO | **YES** | NO | NO |
| Add/remove team members | NO | **YES** | NO | NO |
| View team members | NO | **YES** | **Own Team** | **Own Team** |
| **Leads** | | | | |
| Create new lead | NO | **YES** | **YES** | **YES** |
| View leads | NO | **All Company** | **Team Only** | **Own Only** |
| Edit lead details | NO | **All Company** | **Team Only** | **Own Only** |
| Move pipeline stage | NO | **All Company** | **Team Only** | **Own Only** |
| Reassign lead | NO | **YES** | **Own Team** | NO |
| Soft-delete lead | NO | **YES** | NO | NO |
| **Follow-ups & Tasks** | | | | |
| Create task | NO | **YES** | **YES** | **YES** |
| View tasks | NO | **All Company** | **Team Only** | **Own Only** |
| Mark task completed | NO | **All Company** | **Team Only** | **Own Only** |
| Cancel task | NO | **All Company** | **Team Only** | **Own Only** |
| **Reports** | | | | |
| View reports & exports | Platform Only | **All Company** | **Team Only** | **Own Only** |

