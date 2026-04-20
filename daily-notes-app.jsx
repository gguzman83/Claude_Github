import { useState, useRef, useEffect } from "react";

const RESOURCES = [{"title": "HowIBuilttheExecTechAssessment", "url": "https://docs.google.com/document/d/1odeKoI9GT2lIkA_UoeMmCvRY2ocOg6bCp5KVWc7l5HE/edit?tab=t.0", "type": "doc"}, {"title": "Staff Executive Technical Support Analyst Assessment", "url": "https://script.google.com/a/macros/intuit.com/s/AKfycbyh-jr_COISwjLXofZzK4lJ71EPq2NHYw-LSZbnYCvi/dev", "type": "script"}, {"title": "GilbertLiborio - PromoRecommendation", "url": "https://docs.google.com/document/d/1zXb7sVVUS3jjlMLlT1geSfbmLEnSaCi7CYcxHpVO8VY/edit?tab=t.0", "type": "doc"}, {"title": "MDL rebranding", "url": "https://docs.google.com/document/d/1KWYLteQqfisUNcyeM9uIx_h682PeMz7_l_vhhZULViE/edit?tab=t.0#heading=h.fbqaqri8za8o", "type": "doc"}, {"title": "Claude Rollout: Hypercare Plan", "url": "https://docs.google.com/presentation/d/125Fiy_gb0_FCj8mDlM2YFxCxoWKHBqamIEqImwcVlwI/edit?slide=id.g3824f43f2fb_0_355#slide=id.g3824f43f2fb_0_355", "type": "slides"}, {"title": "Claude AI Kickoff Project Action Items and Meeting Notes", "url": "https://docs.google.com/document/d/1Ze37Gv3DldLnPnRwBnYLCUUmzDwIueod3m-R6cJmHiY/edit?tab=t.0", "type": "doc"}, {"title": "V1 Claude Hyper Care Technical Support Plan", "url": "https://docs.google.com/document/d/18i6LhsxStZjnTrs3tgk748RMgzAhVqEH9Dbly_4gbpk/edit?tab=t.0", "type": "doc"}, {"title": "Claude Enterprise Launch", "url": "https://docs.google.com/document/d/18zqb4yWv5oZZ4BaXao9YcgUZEGEccedERMm8SyDZurc/edit?tab=t.0#heading=h.5hewqjy9esr8", "type": "doc"}, {"title": "Split Role Feedback: 8/1 - 11/1", "url": "https://docs.google.com/document/d/1OfeS2jzolu0SkgbWO-BozCPqZbiqIP4as5XqviICoMk/edit?tab=t.7tsw23tz1tq#heading=h.b1ha8t33ii1y", "type": "doc"}, {"title": "Split Role Engagement Message", "url": "https://docs.google.com/document/u/0/d/14YJ-hMSlkHedludOqgjWk7uPUp3Vme0Q6anB-j8LWhQ/edit", "type": "doc"}, {"title": "Care Launch Runbook", "url": "https://docs.google.com/document/d/15TrQ_dtrd2UExU6Zid2ms9NVeHcrpntn4Pv2C5l5TpE/edit?tab=t.rcx4jvw692qr", "type": "doc"}, {"title": "AI HomePage - Claude", "url": "https://sites.intuit.com/home/intuit-code-assist", "type": "intuit_tool"}, {"title": "Onboarding Guide for Claude Code CLI", "url": "https://devportal.intuit.com/app/dp/capability/CAP-2127/capabilityDocs/main/docs/reference/claudecode/onboarding_guide.md", "type": "intuit_tool"}, {"title": "Copy of Claude Cowork Exception Request (Template)", "url": "https://docs.google.com/document/d/19YiqLRp_qGQovylCwELiAO79UHunwF4ZC7GKTeaSxbw/edit?tab=t.0", "type": "doc"}, {"title": "CLPSE Request", "url": "https://app.smartsheet.com/b/form/25cfaa93af8045f59f619ad193dd228c", "type": "external"}, {"title": "Split Role Engagement Message", "url": "https://docs.google.com/document/d/14YJ-hMSlkHedludOqgjWk7uPUp3Vme0Q6anB-j8LWhQ/edit?tab=t.0", "type": "doc"}, {"title": "INCTSK2462638", "url": "https://intuit.service-now.com/u_incident_task.do?sys_id=dcd6fb06836e7650d992f200feaad3ff&sysparm_record_target=task&sysparm_record_row=2&sysparm_record_rows=2&sysparm_record_list=assignment_group%3Djavascript%3AgetMyGroups%28%29%5Eactive%3Dtrue%5Esys_class_name%21%3Dchange_request%5Esys_class_name%21%3Dproblem%5Esys_class_name%21%3Dsysapproval_group%5Esys_class_name%21%3Dincident%5Esys_class_name%21%3Dfruition_defect%5Esys_class_name%21%3Dsc_request%5Eassigned_to%3De25054c96f1a1100f5db57ee2c3ee46a%5Estate%21%3D6%5EORDERBYDESCsys_updated_on", "type": "external"}, {"title": "Intuit Betterworks Copilot", "url": "https://docs.google.com/document/d/19rcnT0j6GVbSua8j-OVeVtoarPqyXa8CDZ74OMILZBk/edit?tab=t.0", "type": "doc"}, {"title": "Ortho Career Day Template", "url": "https://docs.google.com/presentation/d/1Or_uG0FJxQulP1v4oCCJyzkOTOJ31RdGW-K0WnB4rCs/edit?slide=id.g15d6a927787_0_57#slide=id.g15d6a927787_0_57", "type": "slides"}, {"title": "Update All Progress", "url": "https://app.smartsheet.com/sheets/r88mFFmvxcrWcXVQVPRJ648Wj4vXJ9C8p3Qx3fC1?view=grid", "type": "external"}, {"title": "Mid-Year Ratings", "url": "https://docs.google.com/spreadsheets/d/1bhtd8ggNiGpoeOiaLWB2KqcEWSPHcs3wzO3kLrPOXYo/edit?gid=0#gid=0", "type": "sheet"}, {"title": "Spotlights for all my directs", "url": "https://docs.google.com/spreadsheets/d/1EtEYl_ujr0Zgg81CRqfgNM0XJPFAB83ASpOrATbQlOc/edit?gid=0#gid=0", "type": "sheet"}, {"title": "Manager Onboarding Tracker Portal", "url": "https://global-engineering-days.app.intuit.com/project-dashboard/15c07229-47db-4fed-a195-fc13106cd3bb", "type": "intuit_tool"}, {"title": "Builder", "url": "https://builder.io/", "type": "external"}, {"title": "GEDMgrNewHireWidget", "url": "https://lucid.app/lucidchart/25728446-d7f7-43e7-b2c1-aee45dae394c/edit?beaconFlowId=7C7665329645E514&invitationId=inv_fe279849-9fa3-4d43-ab1d-2b687c8982fd&page=0_0#", "type": "external"}, {"title": "Put GED together with Jess regarding mgr tracker for onboarding", "url": "https://global-engineering-days.app.intuit.com/registration", "type": "intuit_tool"}, {"title": "HR regarding Danny", "url": "https://drive.google.com/drive/folders/1Za0ZkMTKtnGONlSuSmtUqmpkz8WI48Q5?usp=drive_link", "type": "folder"}, {"title": "Endpoint Management UEM Dashboard", "url": "https://es.splunk.intuit.com/en-US/app/search/dashboards", "type": "intuit_tool"}, {"title": "Exec Tech - Craft Demo - V2", "url": "https://docs.google.com/document/d/1eIVILbtYjg02PsgmpoZJr0H7aYJoFirNKIRByZGZpL8/edit?tab=t.r9rs65ofplk0", "type": "doc"}, {"title": "SplitRoleTimeAllocationSlide", "url": "https://docs.google.com/presentation/d/1VlujMh0kI8SV0_5Tt6BQ4LiLY4QMpyMx0OKFabPSRiY/edit?slide=id.g389a6cde335_0_0#slide=id.g389a6cde335_0_0", "type": "slides"}, {"title": "Betterworks AI Check-in Prompt Template Ideas", "url": "https://docs.google.com/document/d/1XrkAKwMXDW_mukrgDNK-IBMirXDuVORjO8vZXmkVZ_A/edit?tab=t.bf6urq73y592", "type": "doc"}, {"title": "One-on-One Meeting Notes Prompt", "url": "https://gemini.google.com/app/fe31a483a76c49ee", "type": "external"}, {"title": "1:1 Meeting Prompts for Me/Mgr & Me/Directs", "url": "https://gemini.google.com/app/1c72c39dace7e666", "type": "external"}, {"title": "UEM Upgrade Comm - Draft v1", "url": "https://docs.google.com/document/d/1bTwE4TzjtiAfXjuMPhiNC5IH9tti2qWe_Xg82plDXwk/edit?tab=t.0", "type": "doc"}, {"title": "EM-UEM-Modernstack", "url": "https://docs.google.com/document/d/1LqHbWqaS3OdNOrrlCGXKC1rP_LbHelIDZPmk5hzvzqM/edit?tab=t.0", "type": "doc"}, {"title": "Legal Hold Dashboard Report", "url": "https://lookerstudio.google.com/reporting/a0840ba6-2721-4070-8745-2c0c422d2a30/page/p_6dv92sxptd", "type": "external"}, {"title": "t4i Care All Hands Agenda (Sept 2025)", "url": "https://docs.google.com/presentation/d/1N90t4nUmqVRj3iIbInAjOsi2YnunDMQLO5rjceRkcPI/edit?slide=id.g1f25788015f_0_0#slide=id.g1f25788015f_0_0", "type": "slides"}, {"title": "IT-Cohort", "url": "https://drive.google.com/drive/folders/1rk0nPEflpnUyEZ3GY72xZmgG2bcD9MFS", "type": "folder"}, {"title": "Legal Hold Audit FY25: Action Plan", "url": "https://docs.google.com/document/d/1IUTA1dyQrLXqfpKHJynasKuZ7EsOBQ0P79m4DK8Dsj8/edit?tab=t.0#heading=h.xts1olijhakn", "type": "doc"}, {"title": "T4i Care: FY26 Strategic Overview", "url": "https://notebooklm.google.com/notebook/5ec01250-01d7-463f-ba40-c0455763d196?pli=1", "type": "external"}, {"title": "Site Inventory Request", "url": "https://gemini.google.com/gems/edit/b4b602069697", "type": "external"}, {"title": "t4i Care FY26 Goals Draft Working Sheet with Managers", "url": "https://docs.google.com/document/d/1QhSmcqC-kLG5GjOiPsDwBkUDSE1ZO0GBO14i7MV41qs/edit?tab=t.0", "type": "doc"}, {"title": "US25932", "url": "https://intuit.service-now.com/now/nav/ui/classic/params/target/alm_hardware.do%3Fsys_id%3D7ba97745471fe110b16ad08c346d43cd%26sysparm_record_target%3Dalm_hardware%26sysparm_record_row%3D1%26sysparm_record_rows%3D76301%26sysparm_record_list%3Dasset_tag%253E%253DUS25932%255EORDERBYasset_tag", "type": "external"}, {"title": "Copy of FY25 t4i- Career Growth Plan Based on Rubric (Service Desk)", "url": "https://docs.google.com/spreadsheets/d/1boJqiqnAr4PXIGqEoRXaNwIklmZGcdsWn_W-RPPJWuA/edit?gid=9581832#gid=9581832", "type": "sheet"}, {"title": "Split Role & P2P Weekly Meeting Notes", "url": "https://docs.google.com/document/d/1JLIaIEVs4hWfpkfDfbO2FkUzl_M3_FmuMLbg_SmpGV8/edit?tab=t.0#heading=h.tcxfvir7kdy0", "type": "doc"}, {"title": "t4i Split Role Program RunBookMain", "url": "https://docs.google.com/document/d/1vr8UgjNcHcwtcEK3GadkTwCv2Wu3m8pKhL7F-J3zYoo/edit?tab=t.0#heading=h.swce0d89w5ny", "type": "doc"}, {"title": "Monthly Check-in Template", "url": "https://gemini.google.com/gems/edit/4f698970180e", "type": "external"}, {"title": "CTREC Split Role Program RunBook", "url": "https://docs.google.com/document/d/1-8dX6uyoSr2hzLLBlc5s4E9C_hARPoG5b0w4gSrpmyo/edit?tab=t.0", "type": "doc"}, {"title": "TASK3121476", "url": "https://intuit.service-now.com/now/nav/ui/classic/params/target/sc_task.do%3Fsys_id%3D99d442ebc3b62250ffbebfef0501310f", "type": "external"}, {"title": "FY25 Year-End Conversation Planner Template", "url": "https://docs.google.com/document/d/1EwTbYUJJE68F4FW7sT2HR7gviYR7R1wte8le0UeIxjI/edit?tab=t.qmewl7t6atfg", "type": "doc"}, {"title": "FY25EOYMgrs", "url": "https://notebooklm.google.com/notebook/02bd36ea-7683-44d0-8f11-8658c3d8e1b9", "type": "external"}, {"title": "Betterworks Goals - Personal Development - FY25", "url": "https://docs.google.com/document/d/1bOBF9mHr8OX-nIHwSImf_5tdiRC1gcYbZosLfuCiYko/edit?tab=t.0", "type": "doc"}, {"title": "Betterworks Goals -CLPSE - FY25", "url": "https://docs.google.com/document/d/1PIiP9SA_V0lQKFAk3tZ9zfMiTNFXudOzm6SlBRsgm-A/edit?tab=t.0", "type": "doc"}, {"title": "Betterworks Goals -Mgr ITB - FY25", "url": "https://docs.google.com/document/d/12oVNU7fYyYkOdAFvADNToDbb7iYsj879WXJ3bPvrJ2Q/edit?tab=t.0#heading=h.tc5y9jvd5izo", "type": "doc"}, {"title": "FY25EOYDirects", "url": "https://notebooklm.google.com/notebook/a0c66d5e-769c-48dc-9aae-13940647375f", "type": "external"}, {"title": "Year-End Manager GuideFY25", "url": "https://docs.google.com/document/d/1e3cdSVk-2cSgGrW5gE3S3HLuNPnnD_oTvV07TyV0Jow/edit?tab=t.gg397qxfn4y0", "type": "doc"}, {"title": "IE Mentorship Framework", "url": "https://docs.google.com/document/d/1neaAJZtcxPNvIwDwi7T2ZlsiB93DtOpfZTj9rZxWYpA/edit?tab=t.x2inhg6k8p6y#heading=h.74i7hu2hgmzd", "type": "doc"}, {"title": "SPEED 2.0", "url": "https://docs.google.com/presentation/d/1BzHkz-NL2iaQ6nw-YzhKY6OqHyfBsDN5Z2TICehyA6A/edit?slide=id.g2c889517512_0_1125#slide=id.g2c889517512_0_1125", "type": "slides"}, {"title": "FY25 FYTD Onsite Contacts", "url": "https://intuit.service-now.com/now/nav/ui/classic/params/target/creator_hub", "type": "external"}, {"title": "t4i Care Metrics - June 2025", "url": "https://docs.google.com/presentation/d/12XXPmpjWuYxEnTKqXeuukEaRjD8yI_40IZWJYorEnKs/edit?slide=id.p11#slide=id.p11", "type": "slides"}, {"title": "Headcount Justification to backfill Terrell and Alex", "url": "https://docs.google.com/document/d/1rfRSsUF5sXjG0Q_U7wA0sIaxJNXGV8vvpFQIax1qwak/edit?tab=t.ykav5etk5p46", "type": "doc"}, {"title": "EOY 25 Notebook LM", "url": "https://notebooklm.google.com/notebook/46498208-09c2-41d4-a954-d2933d18fd23", "type": "external"}, {"title": "SD1/SD2/SD3/SD4 Context Prompt", "url": "https://docs.google.com/document/d/1e0JDo60tawRNeCwN5xcc_T6NKMCQIFD2qpHxF2riJkE/edit?tab=t.0", "type": "doc"}, {"title": "Look for courses on Prompting", "url": "https://intuit.udemy.com/course/chatgpt-promptengineering/learn/lecture/38049828#overview", "type": "external"}, {"title": "BetterWorks Prompts", "url": "https://docs.google.com/document/d/1ECscXbbJXOSVw2QXEb1bxYFhvL33MqKTTQD2osqBgbQ/edit?tab=t.g8z589pt6q7z", "type": "doc"}, {"title": "EOY  Prompting2025 Accomplishments", "url": "https://docs.google.com/document/d/14jn-XTdQJozTCSjEFJ-rITSJX3PGMOyDsVIbgqgFBUw/edit?tab=t.u8xmayrr2d8t", "type": "doc"}, {"title": "Copy of Experience Conversion Prompts for YES - DRAFT", "url": "https://docs.google.com/document/d/10AO75Rjk-Ol3NZ0EZemUwDZPeyfYdzqKt6Tvym5SX8Y/edit?tab=t.0#heading=h.8utmdi6yz9ix", "type": "doc"}, {"title": "Information Technology Craft Skills Rubric - FY25", "url": "https://docs.google.com/presentation/d/1E8D98MI9Q7sNdTVui3S-e8jcyEJMoz6JUDq9pgOeaJM/edit?slide=id.g21c5e84d430_0_5575#slide=id.g21c5e84d430_0_5575", "type": "slides"}, {"title": "Information Technology Job Family Group Craft Skills", "url": "https://sites.intuit.com/home/information-technology-craftskills", "type": "intuit_tool"}, {"title": "CTREC PMO Offsite | AI For Daily Use FY25", "url": "https://docs.google.com/presentation/d/1dWYZZDdD7iDctMCzWMbE0MvgEzaQW0mXAoPft_FtPds/edit?slide=id.g35ab96cfd4d_0_99#slide=id.g35ab96cfd4d_0_99", "type": "slides"}, {"title": "PMO GEN AI QUICK START GUIDE", "url": "https://docs.google.com/presentation/d/14T7vEgoz9QSBTiLojdr1Skeg2hDx-iN0smIi7rxZH0c/edit?slide=id.g3331ac0064c_2_10#slide=id.g3331ac0064c_2_10", "type": "slides"}, {"title": "PDX TPM workshop", "url": "https://docs.google.com/presentation/d/1jJSS9b6x3mp83ifvZTwZWsmMm3Y8yNKqd2bzJA4ojKw/edit?slide=id.g357018c886e_0_1358#slide=id.g357018c886e_0_1358", "type": "slides"}, {"title": "Care Offsite Manager Presentation Notes", "url": "https://docs.google.com/document/d/1f-RY5hlksGREUeH1eNXZAbWwFktseVypnCBrz0LgnYI/edit?tab=t.0", "type": "doc"}, {"title": "T4i Care Manager Guide", "url": "https://docs.google.com/presentation/d/1VqWbSdBGhF_-Mh1WOOcwKXnpoJyP44L_UYo9qKhXRcs/edit?usp=sharing", "type": "slides"}, {"title": "t4i-legalholdmobile", "url": "https://intuit.enterprise.slack.com/archives/C066NRQT589", "type": "slack"}, {"title": "Hardware Asset Legal Hold Users", "url": "https://intuit.service-now.com/now/nav/ui/classic/params/target/sys_user_group.do%3Fsys_id%3D049321a61bfda150bfcbfe6edd4bcbe6%26sysparm_record_list%3DnameSTARTSWITHHardware%2BAsset%2BLegal%2BHold%2BUsers%255EORDERBYname%26sysparm_record_row%3D1%26sysparm_record_rows%3D1%26sysparm_record_target%3Dsys_user_group", "type": "external"}, {"title": "Personal Brand Survey (CW’s)", "url": "https://docs.google.com/forms/d/1wA_89CEVtvMt6TQMTR47ZRQnCRBVzmsm03MOpYhCJds/edit?ts=675a1917", "type": "form"}, {"title": "DRAFT FY26 t4i Care Strategy V1", "url": "https://docs.google.com/document/d/1F3o6P9JaEmVFVKhdQIRQGYDrCniGSuwGKfxyBVDV_m8/edit?tab=t.0", "type": "doc"}, {"title": "Copy of Headcount Business Justification Template for T4I", "url": "https://docs.google.com/document/d/1rfRSsUF5sXjG0Q_U7wA0sIaxJNXGV8vvpFQIax1qwak/edit?tab=t.0", "type": "doc"}, {"title": "Term talking points", "url": "https://docs.google.com/document/d/15IzZxaNxWXDk-ei9tdallOiYialfsFFGVNyffaGynmg/edit?tab=t.iyqv86ctevu0", "type": "doc"}, {"title": "pre termination", "url": "https://docs.google.com/document/d/15IzZxaNxWXDk-ei9tdallOiYialfsFFGVNyffaGynmg/edit?tab=t.ff8358na2tgo", "type": "doc"}, {"title": "Proposal for Legal Hold Data Capture and Validation Support", "url": "https://docs.google.com/document/d/1RScZhzxRZPlQZV00KkUcqi0S_VHJkUlt61YGFP4ufas/edit?tab=t.0#heading=h.kmbgfup6sy22", "type": "doc"}, {"title": "GenStudio Prompts", "url": "https://docs.google.com/document/d/19bVp5wB9Cub1G4Hub0Z2xXGCXkyrmOs0U2DV2Piu3xM/edit?tab=t.0", "type": "doc"}, {"title": "CEO Support Plan (March 2025)", "url": "https://docs.google.com/presentation/d/1x_eXLNNIPwOF1m318H3rvwBiUbKeE_Eqko9qW5zq0YQ/edit#slide=id.g333202b0a70_0_1", "type": "slides"}, {"title": "Split Role Intake Form", "url": "https://docs.google.com/forms/d/e/1FAIpQLSdLF5hMjRvERlKuVmk8al6ckZqyVzPdPBtQsY7aD5-2quW5yw/viewform?usp=sharing", "type": "form"}, {"title": "Split Role Mid-Point Check-in", "url": "https://docs.google.com/forms/d/1CHY3f6oDiFNv0DGfQUjuhKFTftpnloI9sg-r-dQfvJ8/edit", "type": "form"}, {"title": "Tech Split Role Exit Feedback", "url": "https://docs.google.com/forms/d/1qRMUK_R05osnwNP6OAiiTNcY998G9gubnGAhze28LDY/edit", "type": "form"}, {"title": "Mentor Split Role Exit Feedback", "url": "https://docs.google.com/forms/d/1r1FIVYzmkP13u-GULkuCdZn-xIkLUzmBxz2u4c3bzcc/edit", "type": "form"}, {"title": "Peer to Peer Training Intake Form", "url": "https://forms.gle/QyRWLXXxevnPxHnr9", "type": "external"}, {"title": "RITM4459250", "url": "https://intuit.service-now.com/now/nav/ui/classic/params/target/sc_req_item.do%3Fsys_id%3D9557942cc318ee9013bd7713e4013176%26sysparm_record_target%3Dsc_req_item%26sysparm_record_row%3D1%26sysparm_record_rows%3D1%26sysparm_record_list%3Drequest%253D9d57942cc318ee9013bd7713e4013175%255EORDERBYrequest.requested_for", "type": "external"}, {"title": "MTV-Exec-Tech On-Call Escalation", "url": "https://intuit.pagerduty.com/teams/PNOZC4U", "type": "external"}, {"title": "IPCSE-13063", "url": "https://jira.intuit.com/browse/IPCSE-13063", "type": "intuit_tool"}, {"title": "t4i TechKnow Wire - Legal Hold Mobile Process Update", "url": "https://docs.google.com/document/d/1TAAJ9O17lPen4bOR7mWchdgd2L5KuKa9Ujg7VskTj44/edit?tab=t.0#heading=h.9f865dn1j5oh", "type": "doc"}, {"title": "Legal Hold Inventory Status Update Template", "url": "https://docs.google.com/document/d/1W_EcINOanr9G7L0ejyPJJgallMO--3u3Q-Z2Ibe_oDI/edit?tab=t.0", "type": "doc"}, {"title": "Mobile Device Loaner Request", "url": "https://intuit.service-now.com/sp?id=sc_cat_item&sys_id=cf1fdf7ddb36201044ffde46d49619d0", "type": "external"}, {"title": "How Do I Get a Mobile Device for Testing? (KB1341808)", "url": "https://insight.app.intuit.com/it/KB1341808", "type": "intuit_tool"}, {"title": "Loaner Laptop Policy", "url": "https://intuit.service-now.com/sp?id=kb_article&sysparm_article=KB1381780", "type": "external"}, {"title": "KB1381769", "url": "https://intuit.service-now.com/sp?id=kb_article&sysparm_article=KB1381769", "type": "external"}, {"title": "Google Gemini Gem One Pager", "url": "https://docs.google.com/document/d/15C2S1cYZRFTzp4GaX5syuAPuE214i_r3dneUExE32f0/edit?usp=sharing", "type": "doc"}, {"title": "Setting up Gemini Gems for Specific Programs", "url": "https://docs.google.com/document/d/1raMo3QLTC8hMp4D8KHQIbPQjlDHyL62BznlqnG23WuU/edit?tab=t.0#heading=h.rotgdojpw4ve", "type": "doc"}, {"title": "Gemini Slides - Pg. 31", "url": "https://docs.google.com/presentation/d/1NiHVnaRNrP6EwjFNKf3g8eoa3AX1Lha3bis1gzED2qM/edit#slide=id.g2faf09fb560_1_0", "type": "slides"}, {"title": "Gemini Gems - Overview Doc", "url": "https://docs.google.com/document/d/1i7mbszRecOzldidPur1aGDoUAybnJ5Zg23TbMHofZD0/edit?tab=t.0", "type": "doc"}, {"title": "TASK2930282", "url": "https://intuit.service-now.com/now/nav/ui/classic/params/target/sc_task.do%3Fsys_id%3D0d0a636e47df5e505c17b73c326d4333%26sysparm_view%3Dcatalog%26sysparm_record_target%3Dsc_task%26sysparm_record_row%3D1%26sysparm_record_rows%3D1%26sysparm_record_list%3Drequest_item%253D780a236e47df5e505c17b73c326d43b9%255EORDERBYDESCsys_created_on", "type": "external"}, {"title": "Front Line Care Offsite", "url": "https://docs.google.com/document/d/1nVZX90qOdqoIIZD3qvPwMKgvTVB1bGHKp0709Ug8Avg/edit?tab=t.0", "type": "doc"}, {"title": "T4i Split Role Tracking", "url": "https://docs.google.com/spreadsheets/d/1VsPNVvGXlIlS5CTNTAc7HSwX1vhBQ2ycga-OIYFppYw/edit?gid=55055867#gid=55055867", "type": "sheet"}, {"title": "Configuring Filezilla for Legal Hold SFTP", "url": "https://docs.google.com/document/d/1qek6FtVqWuUfTGYDBgPLjPFft73kfuIgG1PsK10Msqg/edit?tab=t.0", "type": "doc"}, {"title": "Deloitte Legal Hold Validation Confirmation", "url": "https://docs.google.com/forms/d/1mGsjmawPHwOEvnUMbRseePNKT7_bGys8kZBT4Q9s60I/edit", "type": "form"}, {"title": "(GLOBAL) LegalHoldsAssetTrackerDeloitte", "url": "https://docs.google.com/spreadsheets/u/0/d/1MGy_XgaKZYSqjt5SGAYMk2ykcXpikmMurtZc7FCEvKE/edit", "type": "sheet"}, {"title": "Shreyas Bharadwaj -  INC1949395", "url": "https://intuit-teams.slack.com/archives/C3D0JTXB6/p1736279000334439", "type": "slack"}, {"title": "TASK2823191", "url": "https://intuit.service-now.com/now/nav/ui/classic/params/target/sc_task.do%3Fsys_id%3D3ff0d5a587451290a22b0e96cebb35a5%26sysparm_view%3Dcatalog%26sysparm_record_target%3Dsc_task%26sysparm_record_row%3D1%26sysparm_record_rows%3D1%26sysparm_record_list%3Drequest_item%253Da3f0d5a587451290a22b0e96cebb351d%255EORDERBYDESCsys_created_on", "type": "external"}, {"title": "Hardware Transfer of Owner", "url": "https://intuit.service-now.com/now/nav/ui/classic/params/target/sc_task.do%3Fsys_id%3D660bbdd5938156903644f2277bba10ba%26sysparm_view%3D%26sysparm_domain%3Dnull%26sysparm_domain_scope%3Dnull%26sysparm_record_row%3D1%26sysparm_record_rows%3D2%26sysparm_record_list%3Dassigned_toISEMPTY%255esys_class_name!%253dincident%255esys_class_name!%253dticket%255eactive%253dtrue%255eassignment_group%253d1b7357786fa4e900f5db57ee2c3ee4b4%255eORassignment_group%253d1125b4496f502100ad4c6592be3ee41f%255eORassignment_group%253d1ecf94f66f7dea80afdb33d9ea3ee4e1%255eORassignment_group%253d49c33b3f6f855a48afdb33d9ea3ee4b1%255estate!%253d4%255estate!%253d8%255eassignment_group%253d1b7357786fa4e900f5db57ee2c3ee4b4%255eshort_descriptionSTARTSWITHHardware%2BTransfer%2Bof%2BOwner%255eORDERBYDESCsys_created_on", "type": "external"}, {"title": "US02844 - Apple Computer Inc MacBook Pro (13-inch, M1, 2020)", "url": "https://intuit.service-now.com/now/nav/ui/classic/params/target/alm_hardware.do%3Fsys_id%3Dc403d0e88737bc502cf5a8683cbb3503%26sysparm_record_target%3Dalm_asset%26sysparm_record_row%3D1%26sysparm_record_rows%3D200080%26sysparm_record_list%3Dserial_number%253E%253DC02GL188Q05N%255EORDERBYserial_number", "type": "external"}, {"title": "US09483 - Apple Computer Inc MacBook M1 Pro (14\" 32GB", "url": "https://intuit.service-now.com/now/nav/ui/classic/params/target/alm_hardware.do%3Fsys_id%3D3aad5bca87ee0d90d810c8cd0ebb35aa%26sysparm_record_target%3Dalm_asset%26sysparm_record_row%3D1%26sysparm_record_rows%3D1%26sysparm_record_list%3Dasset_tagSTARTSWITHUS09483%255EORDERBYserial_number", "type": "external"}, {"title": "RETIRED: How Do I Capture Forensic Image on Legal Hold Computers from End to End? 12/17/2024", "url": "https://intuit.service-now.com/now/nav/ui/classic/params/target/kb_view.do%3Fsys_kb_id%3D2578254383c3865065115300feaad36d%26sysparm_rank%3D7%26sysparm_tsqueryId%3D1560071597ae1254c05fb2ffe153af6f", "type": "external"}, {"title": "CREATE GEMS", "url": "https://docs.google.com/presentation/d/1NiHVnaRNrP6EwjFNKf3g8eoa3AX1Lha3bis1gzED2qM/edit#slide=id.g3159112813c_0_260", "type": "slides"}, {"title": "GeminiGems", "url": "https://gemini.google.com/app", "type": "external"}, {"title": "Legal Hold Returns - ShippedFromOtherSites", "url": "https://docs.google.com/spreadsheets/d/1L_VCNOEKA7GTjm-RcUgJldGQpGEAQquJx-CXbz55ACE/edit?gid=1102168539#gid=1102168539", "type": "sheet"}, {"title": "Complete MTV 22 Legal Hold Inventory Validation", "url": "https://docs.google.com/spreadsheets/d/1ACVf1IryR9fBy5raeqUeN6t1H8KJ8sLPsdHYqbZwfo4/edit?gid=327698587#gid=327698587", "type": "sheet"}, {"title": "set up group Slack with Michael M, Shawn B., Keven Tran", "url": "https://intuit.enterprise.slack.com/archives/C085S7HS4FJ", "type": "slack"}, {"title": "SecurityQB: Global list of all those in Sec/Reception", "url": "https://intuitcorp.quickbase.com/nav/app/bhzi23rxs/table/br5r3dct8/action/td", "type": "external"}, {"title": "Peer2Peer & Split Role Nov2024", "url": "https://docs.google.com/presentation/d/1bXJy9lROpvDGSTZeCBcuI1c6NMj6tfreTvcd6tiEMkQ/edit#slide=id.g2060e0ad2f4_0_920", "type": "slides"}, {"title": "T4i Stretch & Split Role Tracking", "url": "https://docs.google.com/spreadsheets/d/1VsPNVvGXlIlS5CTNTAc7HSwX1vhBQ2ycga-OIYFppYw/edit?gid=1161341563#gid=1161341563", "type": "sheet"}, {"title": "Resolving Platform Dependencies - Local Admin Permissions for Forensic Capturing", "url": "https://docs.google.com/document/d/19jRSYsxM1AFX4ga5PQuc5eHbgn_w3TRxahRXJxy-7uI/edit", "type": "doc"}, {"title": "V2-How Do I Process Legal Hold Computers from Start to Finish?", "url": "https://docs.google.com/document/d/1B0e9oWwkl83XJ-LGIT608sQJJ79TbutINmDD7e1B108/edit?usp=sharing", "type": "doc"}, {"title": "Legal Hold AWS Permissions - Top Level", "url": "https://docs.google.com/document/d/1n2CHKIMPrx80ja0GHr5Lz_K9B8SPq3oT50t7P7_qPM8/edit?usp=sharing", "type": "doc"}, {"title": "Legal Hold HighLevel Summary - Lance-Weekly", "url": "https://docs.google.com/document/d/1jA9DpL3cNGn0Fkl41Lm5uRGZqmB9ZlM5yR7Jk3l63qk/edit#heading=h.o381329lcklt", "type": "doc"}, {"title": "KFT - Tech Follow-ups", "url": "https://docs.google.com/spreadsheets/d/1_X-z449Kq0hv8GMOOY1hT3-52gWkx9Je1HM5NDhF5HM/edit#gid=0", "type": "sheet"}, {"title": "Intuit ERG Mentorship Program", "url": "https://intuitmentorship.chronus.com/p/p3?src=side_navigation", "type": "external"}, {"title": "Runbook style for L2 onboarding documentation", "url": "https://docs.google.com/document/d/1twV8pm_F_PI7Qcgl35Q4T12Zab1mR4Numn82GJFjyG8/edit?usp=sharing", "type": "doc"}, {"title": "Get hardware to send out to vendor per Kar", "url": "https://docs.google.com/spreadsheets/d/1jmSQFZMhHBpitH8LhyGU_caHhb9EVLH-A-ZHbUY7QOA/edit#gid=0", "type": "sheet"}, {"title": "LegalHoldCleanupTemplate", "url": "https://docs.google.com/document/d/1Pifho9u-w0ukeOXKPhQPYNKMGE0SKBLccKkidXxvTJM/edit", "type": "doc"}, {"title": "Decision: Narrow Legal Device Holds", "url": "https://docs.google.com/document/d/1yuNMr7KorW6o49doXVon8C0eqenXOQLbC6ZXAavDRys/edit", "type": "doc"}, {"title": "macOS EFI Pin Lock Updated Storage Solution", "url": "https://docs.google.com/document/d/15oUSMg63VudB7Dk3iYzThXJZGgHvpVrpJW6YdUxht0w/edit", "type": "doc"}, {"title": "Lockout Updaters", "url": "https://intuit.swoogo.com/may-fy24-ged/portal?i=FaVq-fD1IlckhxBYHB49VRahsil00hKe", "type": "external"}, {"title": "Exec Tech - Craft Demo", "url": "https://docs.google.com/document/d/1WYONx4FKWyzGXPbmhZJkV1HdZt9KzQxnNKKB5F-HfIU/edit#heading=h.rmvpngcr24rm", "type": "doc"}, {"title": "On-Site Legal Holds Inventory", "url": "https://docs.google.com/spreadsheets/d/1NdvF94tbNe2EOpLM9LHwM7zIfK7olsnfV8hXov1218c/edit#gid=0", "type": "sheet"}, {"title": "t4i TechKnow Wire - EFI Pin Code Update", "url": "https://docs.google.com/document/d/1ilisiNKflvoivDLRoi5QabbtK6YJ9g2gOS9RYCIY94g/edit#heading=h.pjxel35c7q05", "type": "doc"}, {"title": "Mac is Locked and Requiring PIN Code (EFI)", "url": "https://intuit.service-now.com/kb_view.do?sysparm_article=KB1361308", "type": "external"}, {"title": "Lenovo Cloud Deploy", "url": "https://www.lenovoclouddeploy.com/en/home", "type": "external"}, {"title": "t4i TechKnow Wire - Legal Hold Asset Management Update", "url": "https://docs.google.com/document/d/1kp8VgeGdSSuS7BqoXJBe9e4n1_yWVPKzRUp6FqKC4Ko/edit#heading=h.g8zfia1eg5si", "type": "doc"}, {"title": "How Do I Process Hardware for Users on Legal Hold?", "url": "https://docs.google.com/document/d/1noqbA2v2sXwXpSJ1Rvg4wn-GHNcByPmq2eYc0rrbi1E/edit#heading=h.bwm300ncllxh", "type": "doc"}, {"title": "V3- How Do I Process Legal Hold Computers from Start to Finish?", "url": "https://docs.google.com/document/d/1k-pVA6uhG6P8FFw0h2Gh5Iz40YSc018lJohmj7X1pwk/edit", "type": "doc"}, {"title": "How Do I Capture Forensic Image on Legal Hold Computers from End to End?", "url": "https://intuit.service-now.com/kb_view.do?sysparm_article=KB1366153", "type": "external"}, {"title": "How Do I Provide Access to View Legal Holds in AWS? (L2 Only)", "url": "https://intuit.service-now.com/kb_view.do?sysparm_article=KB1373751", "type": "external"}, {"title": "End-to-End Process - 3rd Party Extraction", "url": "https://docs.google.com/document/d/178mT3oDVTA_bEh8lC_CrzXj8Tl3aoyWZe2WTpAV5V-Y/edit", "type": "doc"}, {"title": "Legal Hold Access Request", "url": "https://intuit.service-now.com/sp?id=sc_cat_item&sys_id=d1eb520a6fa75100ad4c6592be3ee400&sysparm_application=7aa7079d1bbc0a10bfcbfe6edd4bcb0d", "type": "external"}, {"title": "Legal Hold On-Site Inventory", "url": "https://docs.google.com/spreadsheets/d/1NdvF94tbNe2EOpLM9LHwM7zIfK7olsnfV8hXov1218c/edit?gid=624350579#gid=624350579", "type": "sheet"}, {"title": "NEED to CREATE 1 SLIDE for Legal", "url": "https://docs.google.com/presentation/d/1kh8OjF_VKzdV5wdk5GzMSjRFUfny9FyGFe4kc6n6bWQ/edit#slide=id.g2ece7be4bbe_1_0", "type": "slides"}, {"title": "T4i TechKnow Wire: Event Support Reminder Comms", "url": "https://docs.google.com/document/d/17myh_nQdmUJjsYTKzNQISbJ3zuwjh8TVejncAMP0kyM/edit", "type": "doc"}, {"title": "Request Loaner Laptop", "url": "https://intuit.service-now.com/sp?id=sc_cat_item&table=sc_cat_item&sys_id=3f302a5fdbb600502cbae855ca96196e", "type": "external"}, {"title": "Mobile Device Loaner Request", "url": "https://intuit.service-now.com/sp?id=sc_cat_item&table=sc_cat_item&sys_id=cf1fdf7ddb36201044ffde46d49619d0", "type": "external"}, {"title": "Loaner Accessory Request", "url": "https://intuit.service-now.com/sp?id=sc_cat_item&table=sc_cat_item&sys_id=2cfc05c3db08085003166451ca961947", "type": "external"}, {"title": "Conference Room and Event Support", "url": "https://intuit.service-now.com/sp?id=sc_cat_item&table=sc_cat_item&sys_id=1a1cd230db63f74003166451ca961924", "type": "external"}, {"title": "1on1 DriveFolder", "url": "https://drive.google.com/drive/folders/1LUpzeOMUfqo_yor9SHne-Cga24dzCcL4?usp=drive_link", "type": "folder"}, {"title": "Work on Timeline", "url": "https://docs.google.com/presentation/d/1VMdjLRRFrCIXv54MU56fVkJwWgjpTLKjkahlthqvF74/edit#slide=id.p12", "type": "slides"}, {"title": "High-Touch: Keep My Computer Request Quick Process", "url": "https://docs.google.com/document/d/1ySHEDXniJ7jAOyPJ1UimCzP2npACJQk4-mpVu8__qvQ/edit", "type": "doc"}, {"title": "Keep My Computer Request Quick Process", "url": "https://docs.google.com/document/d/1vnT0WjdQzSGWCayj9AJOT3v5BrbwmNLDFSqCDiWbN9k/edit", "type": "doc"}, {"title": "TechKnow Wire: Legal Hold Process Reminder", "url": "https://docs.google.com/document/d/1oKEi2uJf8pdErX7oUEEqXj3NR9DFik00IUQW7dUFsAg/edit", "type": "doc"}, {"title": "Comms and workflow / scaling Notes for final two weeks of Tempo to activate those not taking action", "url": "https://docs.google.com/document/d/1X7IMQmQpudCaKyYq8o7GE--w6yYbQ9fgrdAVK-YQdkY/edit", "type": "doc"}, {"title": "achang13: AB03554 - Apple Computer Inc MacBook", "url": "https://intuit.service-now.com/now/nav/ui/classic/params/target/alm_hardware.do%3Fsys_id%3D8b188de31b1ba010d5260e94604bcbcf%26sysparm_record_list%3Dasset_tag%253E%253DAB03554%255EORDERBYasset_tag%26sysparm_record_row%3D1%26sysparm_record_rows%3D158719%26sysparm_record_target%3Dalm_asset", "type": "external"}, {"title": "MTV 5 & 6 SDA Migration Plan", "url": "https://docs.google.com/document/d/173jTuTjYJYFeF-G4L_HACEaEgSA6oaOY/edit", "type": "doc"}, {"title": "KB1376437", "url": "https://intuit.service-now.com/kb_view.do?sysparm_article=KB1376437", "type": "external"}, {"title": "Legal HoldsDeloitte", "url": "https://drive.google.com/drive/u/0/folders/17UnjEscgrnY2gEy3EQjGScMtZ9L7vzP3", "type": "folder"}, {"title": "Loaners/Local event Support", "url": "https://intuit.service-now.com/now/nav/ui/classic/params/target/kb_view.do%3Fsys_kb_id%3Dfba5f17d878cc610a22b0e96cebb3564%26sysparm_rank%3D1%26sysparm_tsqueryId%3Dd03456b5c3685ed8e3263afb0501318e", "type": "external"}, {"title": "Resolving Platform Dependencies - Loaner/Local Event Image", "url": "https://docs.google.com/document/d/1h43dWrtcefPRBOexL02K-h3YT3owSHZY66I9mGZuYv8/edit#heading=h.mcpnl0h8gi9i", "type": "doc"}, {"title": "How Do I Validate Legal Hold Images?", "url": "https://docs.google.com/document/d/1drJRLXpzHdQKTaY5E59YP_r3PCoDsYlvHujgjscgveY/edit", "type": "doc"}, {"title": "images on PC from Deloitte", "url": "https://docs.google.com/document/d/1UByl6oNALJ7zc1c20hdhDGpTTUOv1zUo9IqdeMOSEI0/edit#heading=h.y5yyf4gvjfvj", "type": "doc"}, {"title": "NoRecoveryKeyMovetoAZ", "url": "https://docs.google.com/spreadsheets/d/1N_ePXwVQo2_onRaJ4pFb0NDGK3l8b34X8fcJbxQiYc0/edit?gid=0#gid=0", "type": "sheet"}, {"title": "L2 Ops & Engineering Sync Summary", "url": "https://docs.google.com/document/d/1UmPrU4ukr67mXRhkCMN3LZiVAbcoYp-YwxAn6A7ebTs/edit", "type": "doc"}, {"title": "How Do I Create and/or Setup an Event Loaner MacBook Pro (Apple Silicon Chipset)?", "url": "https://intuit.service-now.com/kb_view.do?sysparm_article=KB1375582", "type": "external"}, {"title": "Anchor Document: Intuit Events Laptop Setup Procedures", "url": "https://intuit.service-now.com/kb_view.do?sysparm_article=KB1370909", "type": "external"}, {"title": "How Do I Request a Loaner Laptop or Power Supply?", "url": "https://intuit.service-now.com/kb_view.do?sysparm_article=KB0023484", "type": "external"}, {"title": "Corp Event Support vs. Local Event Support: Loaner Laptop Requests", "url": "https://intuit.service-now.com/kb_view.do?sysparm_article=KB1376924", "type": "external"}, {"title": "GED Dashboard", "url": "https://global-engineering-days.app.intuit.com/dashboard", "type": "intuit_tool"}, {"title": "New Hire Onboarding with ServiceNow Integration and SmartSheet Check-In Form", "url": "https://global-engineering-days.app.intuit.com/project-dashboard/e30034f9-ce9e-4026-a583-367dd89b2a27", "type": "intuit_tool"}, {"title": "T4I Tech Support Mobile Application Enhancement", "url": "https://global-engineering-days.app.intuit.com/project-dashboard/3f3c5e9f-e505-44a9-8800-1f351b73886f", "type": "intuit_tool"}, {"title": "Mobile Device Lab Smartsheet Integration into Service Now", "url": "https://global-engineering-days.app.intuit.com/project-dashboard/e511b77f-b193-4ecd-b06c-3dc8ea416f56", "type": "intuit_tool"}, {"title": "Children on Spectrum", "url": "https://docs.google.com/presentation/d/1rS1YLQVEJSDAPf8LI-zhtm1zPYdFKPolaU4kDf8Cag0/edit#slide=id.g30cc68e1b59_0_35", "type": "slides"}, {"title": "Lunch and Learn", "url": "https://docs.google.com/document/d/1XaP4WAZKKuXZcfmoVeGoHJnnbgRFT8F65Ici-hGKmyg/edit", "type": "doc"}, {"title": "@azamora1", "url": "https://intuit-teams.slack.com/team/U06HGKFUT0A", "type": "slack"}, {"title": "@zhussein", "url": "https://intuit-teams.slack.com/team/U06L08FBMF1", "type": "slack"}, {"title": "@vpulido", "url": "https://intuit-teams.slack.com/team/U05AD254XBR", "type": "slack"}, {"title": "@bmartinez6", "url": "https://intuit-teams.slack.com/team/U07E1LDKK34", "type": "slack"}, {"title": "CW Career Plan Template", "url": "https://docs.google.com/presentation/d/1ArvfQMbjzw9cZAE7qSGiSy9OpufY-hDNY3LXaP4hF4s/edit?usp=sharing", "type": "slides"}, {"title": "Code.gs", "url": "http://Code.gs", "type": "external"}, {"title": "Gmail Restart Workshop", "url": "https://docs.google.com/spreadsheets/d/1BRS8A06CjNdA-cHJeNG5Kjq7nwp0toj7hLv9pgDLzk8/edit?gid=1476886120#gid=1476886120", "type": "sheet"}, {"title": "ExecTechAssessment-DocumentationApr2026", "url": "https://docs.google.com/document/d/1jluhJlVrrhVTVqoneVjooFlORZNIVVsidJfmXl-jcJE/edit?tab=t.0", "type": "doc"}, {"title": "ClaudeGithub", "url": "https://github.com/gguzman83/Claude_Github", "type": "external"}, {"title": "uem-recovery-key-bu", "url": "https://devportal.intuit.com/app/dp/resource/5915495703874679032/addons/idps", "type": "intuit_tool"}, {"title": "Apps Script", "url": "https://script.google.com/home/projects/1R5nxXSqLnf0HFVqtwjm2qpMuag3UjmfVkSinjWv2vES73g280a2-qZJv/triggers", "type": "script"}, {"title": "Tech People Manager Rubric (non-engineering)2026", "url": "https://docs.google.com/presentation/d/1ni16Vm0P3lCOUvW6pGWrZM9OU3TsPgqquOKlGm_26WE/edit?slide=id.g3c95d986fcf_0_54#slide=id.g3c95d986fcf_0_54", "type": "slides"}, {"title": "Aravo", "url": "https://intuitsso.aravo.com/aems/task/searches.do#!/search", "type": "external"}, {"title": "Staff Executive Technical Support Analyst Assessment", "url": "https://script.google.com/a/macros/intuit.com/s/AKfycbzUKIFwhNma6RfRd-a-yitbmnuWfO9ABfcyVp3rR5ACfsUgYXLJHqT8iizeGfGq8RcKbg/exec", "type": "script"}, {"title": "Rubric FY26", "url": "https://docs.google.com/spreadsheets/d/1uGZRjeLEYKz3vuGqNy2hhqCAa12gHY69pdPgIhvXR-I/edit?gid=0#gid=0", "type": "sheet"}];

const TYPE_META = {
  doc:         { label: "Google Docs",     icon: "📄", color: "#4285F4" },
  sheet:       { label: "Google Sheets",   icon: "📊", color: "#0F9D58" },
  slides:      { label: "Google Slides",   icon: "📽️", color: "#F4B400" },
  form:        { label: "Google Forms",    icon: "📋", color: "#AB47BC" },
  folder:      { label: "Drive Folders",   icon: "📁", color: "#F57C00" },
  script:      { label: "Apps Scripts",    icon: "⚙️", color: "#6D4C41" },
  intuit_tool: { label: "Intuit Tools",    icon: "🏢", color: "#365EBF" },
  slack:       { label: "Slack",           icon: "💬", color: "#4A154B" },
  external:    { label: "External",        icon: "🌐", color: "#546E7A" },
};

const CATEGORIES = [
  { id: "incidents",  label: "Incidents & Escalations", emoji: "🔥", color: "#ef4444", bg: "#fef2f2", border: "#fecaca", keywords: ["incident","ticket","outage","escalat","sev","urgent","down","issue","broke","error","fail","servicenow","snow"] },
  { id: "tasks",      label: "Tasks & Action Items",    emoji: "✅", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", keywords: ["task","action","todo","complete","finish","update","send","schedule","review","submit","create","set up","follow up","need to"] },
  { id: "projects",   label: "Projects & Initiatives",  emoji: "🏗️", color: "#7c3aed", bg: "#faf5ff", border: "#ddd6fe", keywords: ["project","initiative","launch","rollout","clpse","program","phase","milestone","split role","claude","legal hold","mtv","sf","mtl","mdl"] },
  { id: "meetings",   label: "Meetings & Syncs",        emoji: "📅", color: "#0284c7", bg: "#f0f9ff", border: "#bae6fd", keywords: ["meeting","sync","call","1:1","standup","check-in","debrief","agenda","discuss","talked","met with","catch up"] },
];

function autoCategory(text) {
  const lower = text.toLowerCase();
  let best = null, bestScore = 0;
  for (const cat of CATEGORIES) {
    const score = cat.keywords.filter(k => lower.includes(k)).length;
    if (score > bestScore) { bestScore = score; best = cat.id; }
  }
  return best || "tasks";
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function formatDate(date) {
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

// ─── Resources Page ───────────────────────────────────────────────────────────
function ResourcesPage({ onBack }) {
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("all");

  const types = ["all", ...Object.keys(TYPE_META)];
  const filtered = RESOURCES.filter(r => {
    const matchType = activeType === "all" || r.type === activeType;
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.url.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const countByType = {};
  for (const r of RESOURCES) countByType[r.type] = (countByType[r.type] || 0) + 1;

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc", fontFamily:"system-ui,sans-serif" }}>
      {/* Header */}
      <div style={{ background:"#1e293b", color:"white", padding:"16px 24px", display:"flex", alignItems:"center", gap:"16px", position:"sticky", top:0, zIndex:10 }}>
        <button onClick={onBack} style={{ background:"rgba(255,255,255,0.15)", border:"none", color:"white", borderRadius:"8px", padding:"8px 16px", cursor:"pointer", fontSize:"14px", display:"flex", alignItems:"center", gap:"6px" }}>
          ← Back to Notes
        </button>
        <div>
          <div style={{ fontSize:"18px", fontWeight:700 }}>🔗 Resources & Docs</div>
          <div style={{ fontSize:"12px", opacity:0.7 }}>{RESOURCES.length} links from your Daily Tasks doc</div>
        </div>
        <div style={{ marginLeft:"auto" }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search resources..."
            style={{ padding:"8px 14px", borderRadius:"8px", border:"none", fontSize:"14px", width:"260px", background:"rgba(255,255,255,0.15)", color:"white", outline:"none" }}
          />
        </div>
      </div>

      {/* Type tabs */}
      <div style={{ background:"white", borderBottom:"1px solid #e2e8f0", padding:"0 24px", display:"flex", gap:"4px", overflowX:"auto" }}>
        {types.map(t => {
          const meta = TYPE_META[t];
          const count = t === "all" ? RESOURCES.length : (countByType[t] || 0);
          if (count === 0) return null;
          return (
            <button key={t} onClick={() => setActiveType(t)}
              style={{ padding:"12px 16px", border:"none", borderBottom: activeType===t ? "2px solid #6366f1" : "2px solid transparent", background:"none", cursor:"pointer", fontSize:"13px", fontWeight: activeType===t ? 600 : 400, color: activeType===t ? "#6366f1" : "#64748b", whiteSpace:"nowrap" }}>
              {meta ? `${meta.icon} ${meta.label}` : "🗂️ All"} <span style={{ background:"#f1f5f9", borderRadius:"12px", padding:"2px 8px", fontSize:"11px", marginLeft:"4px" }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Links grid */}
      <div style={{ padding:"24px", display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(320px, 1fr))", gap:"12px" }}>
        {filtered.length === 0 && (
          <div style={{ gridColumn:"1/-1", textAlign:"center", color:"#94a3b8", padding:"40px" }}>No results found.</div>
        )}
        {filtered.map((r, i) => {
          const meta = TYPE_META[r.type] || TYPE_META.external;
          return (
            <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
              style={{ display:"block", padding:"14px 16px", background:"white", borderRadius:"10px", border:"1px solid #e2e8f0", textDecoration:"none", color:"inherit", transition:"all 0.15s", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = meta.color; e.currentTarget.style.boxShadow = `0 2px 8px rgba(0,0,0,0.1)`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"; }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:"10px" }}>
                <span style={{ fontSize:"18px", flexShrink:0, marginTop:"1px" }}>{meta.icon}</span>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:"14px", fontWeight:600, color:"#1e293b", lineHeight:"1.4", overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{r.title}</div>
                  <div style={{ fontSize:"11px", color:"#94a3b8", marginTop:"4px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.url.replace(/https?:\/\//, "").substring(0, 55)}...</div>
                </div>
                <span style={{ marginLeft:"auto", fontSize:"10px", background:meta.color+"20", color:meta.color, padding:"2px 8px", borderRadius:"99px", whiteSpace:"nowrap", flexShrink:0, fontWeight:600 }}>{meta.label}</span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

// ─── Note Card ────────────────────────────────────────────────────────────────
function NoteCard({ note, onDelete, onToggleDone }) {
  return (
    <div style={{ padding:"10px 12px", background:"white", borderRadius:"8px", border:"1px solid #e2e8f0", marginBottom:"8px", opacity: note.done ? 0.55 : 1 }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:"8px" }}>
        <input type="checkbox" checked={note.done} onChange={() => onToggleDone(note.id)} style={{ marginTop:"3px", cursor:"pointer" }} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:"13px", color:"#1e293b", textDecoration: note.done ? "line-through" : "none", wordBreak:"break-word" }}>{note.text}</div>
          <div style={{ fontSize:"11px", color:"#94a3b8", marginTop:"3px" }}>{formatTime(new Date(note.time))}</div>
        </div>
        <button onClick={() => onDelete(note.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"#cbd5e1", fontSize:"14px", padding:"0 2px", lineHeight:1 }}>×</button>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function DailyNotes() {
  const [view, setView] = useState("home");
  const [input, setInput] = useState("");
  const [selectedCat, setSelectedCat] = useState("auto");
  const [notes, setNotes] = useState({ incidents: [], tasks: [], projects: [], meetings: [] });
  const [liveNotes, setLiveNotes] = useState("");
  const [liveLog, setLiveLog] = useState([]);
  const [liveInput, setLiveInput] = useState("");
  const inputRef = useRef();

  // today info
  const today = formatDate(new Date());

  function addNote(e) {
    e.preventDefault();
    if (!input.trim()) return;
    const cat = selectedCat === "auto" ? autoCategory(input) : selectedCat;
    const entry = { id: Date.now(), text: input.trim(), time: Date.now(), done: false };
    setNotes(prev => ({ ...prev, [cat]: [entry, ...prev[cat]] }));
    setInput("");
    inputRef.current?.focus();
  }

  function deleteNote(catId, noteId) {
    setNotes(prev => ({ ...prev, [catId]: prev[catId].filter(n => n.id !== noteId) }));
  }
  function toggleDone(catId, noteId) {
    setNotes(prev => ({ ...prev, [catId]: prev[catId].map(n => n.id === noteId ? {...n, done: !n.done} : n) }));
  }

  function addLiveNote(e) {
    e.preventDefault();
    if (!liveInput.trim()) return;
    setLiveLog(prev => [{ id: Date.now(), text: liveInput.trim(), time: Date.now() }, ...prev]);
    setLiveInput("");
  }

  if (view === "resources") return <ResourcesPage onBack={() => setView("home")} />;

  return (
    <div style={{ minHeight:"100vh", background:"#f1f5f9", fontFamily:"system-ui,sans-serif" }}>
      {/* Header */}
      <div style={{ background:"#1e293b", color:"white", padding:"14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:"20px", fontWeight:700 }}>📓 Daily Notes</div>
          <div style={{ fontSize:"12px", opacity:0.6, marginTop:"2px" }}>{today}</div>
        </div>
        <button onClick={() => setView("resources")}
          style={{ background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.25)", color:"white", borderRadius:"8px", padding:"8px 18px", cursor:"pointer", fontSize:"14px", fontWeight:600 }}>
          🔗 Resources & Docs →
        </button>
      </div>

      {/* Quick Capture */}
      <div style={{ background:"white", borderBottom:"1px solid #e2e8f0", padding:"14px 24px" }}>
        <form onSubmit={addNote} style={{ display:"flex", gap:"10px", alignItems:"center" }}>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            placeholder="Type a note and hit Enter — I'll auto-categorize it..."
            style={{ flex:1, padding:"10px 16px", borderRadius:"8px", border:"1.5px solid #e2e8f0", fontSize:"14px", outline:"none", transition:"border-color 0.15s" }}
            onFocus={e => e.target.style.borderColor = "#6366f1"}
            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
          />
          <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)}
            style={{ padding:"10px 12px", borderRadius:"8px", border:"1.5px solid #e2e8f0", fontSize:"13px", background:"white", color:"#374151", cursor:"pointer" }}>
            <option value="auto">✨ Auto-detect</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
          </select>
          <button type="submit" style={{ padding:"10px 22px", background:"#6366f1", color:"white", border:"none", borderRadius:"8px", fontSize:"14px", fontWeight:600, cursor:"pointer" }}>
            Add
          </button>
        </form>
      </div>

      {/* Body */}
      <div style={{ padding:"20px 24px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
        {CATEGORIES.map(cat => {
          const catNotes = notes[cat.id];
          const doneCount = catNotes.filter(n => n.done).length;
          return (
            <div key={cat.id} style={{ background:"white", borderRadius:"12px", border:`1px solid ${cat.border}`, overflow:"hidden" }}>
              <div style={{ padding:"12px 16px", background:cat.bg, borderBottom:`1px solid ${cat.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                  <span style={{ fontSize:"18px" }}>{cat.emoji}</span>
                  <span style={{ fontSize:"14px", fontWeight:700, color:cat.color }}>{cat.label}</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                  {doneCount > 0 && <span style={{ fontSize:"11px", color:"#16a34a", background:"#dcfce7", padding:"2px 8px", borderRadius:"99px" }}>✓ {doneCount} done</span>}
                  <span style={{ fontSize:"11px", background:"white", color:cat.color, padding:"2px 10px", borderRadius:"99px", fontWeight:700, border:`1px solid ${cat.border}` }}>{catNotes.length}</span>
                </div>
              </div>
              <div style={{ padding:"12px", minHeight:"120px", maxHeight:"260px", overflowY:"auto" }}>
                {catNotes.length === 0
                  ? <div style={{ color:"#cbd5e1", fontSize:"13px", textAlign:"center", paddingTop:"30px" }}>No notes yet</div>
                  : catNotes.map(n => <NoteCard key={n.id} note={n} onDelete={id => deleteNote(cat.id, id)} onToggleDone={id => toggleDone(cat.id, id)} />)
                }
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Notes */}
      <div style={{ margin:"0 24px 24px", background:"white", borderRadius:"12px", border:"1px solid #e2e8f0", overflow:"hidden" }}>
        <div style={{ padding:"12px 16px", background:"#fafafa", borderBottom:"1px solid #e2e8f0", display:"flex", alignItems:"center", gap:"8px" }}>
          <span style={{ fontSize:"18px" }}>📝</span>
          <span style={{ fontSize:"14px", fontWeight:700, color:"#374151" }}>Live Notes</span>
          <span style={{ fontSize:"12px", color:"#94a3b8" }}>— stream of consciousness, timestamped</span>
        </div>
        <div style={{ padding:"12px 16px" }}>
          <form onSubmit={addLiveNote} style={{ display:"flex", gap:"8px", marginBottom:"12px" }}>
            <input value={liveInput} onChange={e => setLiveInput(e.target.value)}
              placeholder="Jot anything down — no category needed..."
              style={{ flex:1, padding:"9px 14px", borderRadius:"8px", border:"1.5px solid #e2e8f0", fontSize:"13px", outline:"none" }}
              onFocus={e => e.target.style.borderColor = "#6366f1"}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"}
            />
            <button type="submit" style={{ padding:"9px 18px", background:"#f1f5f9", color:"#374151", border:"1px solid #e2e8f0", borderRadius:"8px", fontSize:"13px", fontWeight:600, cursor:"pointer" }}>Log</button>
          </form>
          <div style={{ maxHeight:"200px", overflowY:"auto" }}>
            {liveLog.length === 0
              ? <div style={{ color:"#cbd5e1", fontSize:"13px", textAlign:"center", padding:"20px" }}>Nothing logged yet today</div>
              : liveLog.map(entry => (
                <div key={entry.id} style={{ display:"flex", gap:"10px", padding:"7px 0", borderBottom:"1px solid #f1f5f9", alignItems:"flex-start" }}>
                  <span style={{ fontSize:"11px", color:"#94a3b8", whiteSpace:"nowrap", marginTop:"2px", minWidth:"50px" }}>{formatTime(new Date(entry.time))}</span>
                  <span style={{ fontSize:"13px", color:"#374151", flex:1 }}>{entry.text}</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}
