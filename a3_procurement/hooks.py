app_name = "a3_procurement"
app_title = "A3 Procurement"
app_publisher = "Acube"
app_description = "Procurement App"
app_email = "admin@acube.co"
app_license = "mit"

# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "a3_procurement",
# 		"logo": "/assets/a3_procurement/logo.png",
# 		"title": "A3 Procurement",
# 		"route": "/a3_procurement",
# 		"has_permission": "a3_procurement.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/a3_procurement/css/a3_procurement.css"
# app_include_js = "/assets/a3_procurement/js/a3_procurement.js"

# include js, css files in header of web template
# web_include_css = "/assets/a3_procurement/css/a3_procurement.css"
# web_include_js = "/assets/a3_procurement/js/a3_procurement.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "a3_procurement/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "a3_procurement/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "a3_procurement.utils.jinja_methods",
# 	"filters": "a3_procurement.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "a3_procurement.install.before_install"
# after_install = "a3_procurement.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "a3_procurement.uninstall.before_uninstall"
# after_uninstall = "a3_procurement.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "a3_procurement.utils.before_app_install"
# after_app_install = "a3_procurement.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "a3_procurement.utils.before_app_uninstall"
# after_app_uninstall = "a3_procurement.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "a3_procurement.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"a3_procurement.tasks.all"
# 	],
# 	"daily": [
# 		"a3_procurement.tasks.daily"
# 	],
# 	"hourly": [
# 		"a3_procurement.tasks.hourly"
# 	],
# 	"weekly": [
# 		"a3_procurement.tasks.weekly"
# 	],
# 	"monthly": [
# 		"a3_procurement.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "a3_procurement.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "a3_procurement.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "a3_procurement.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["a3_procurement.utils.before_request"]
# after_request = ["a3_procurement.utils.after_request"]

# Job Events
# ----------
# before_job = ["a3_procurement.utils.before_job"]
# after_job = ["a3_procurement.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"a3_procurement.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

fixtures = [
{
    "dt": "Workflow",
    "filters": [
        ["name", "in", 
        [
            'Purchase  and Negotiation Committee Workflow',
            'Purchase Approval Workflow',
            'Purchase Recommendation Workflow',
            'Indent Workflow',
            'In-Principle Approval Workflow',
            'Proprietory Article Certificate Work Flow'
         ]]
    ]
},
{
    "dt": "Workflow State",
    "filters": [
        ["name", "in", 
        [
            'Pending HOD Approval',
            'Pending CS Approval',
            'Pending CFO Approval',
            'Pending GM Approval',
            'Pending MD Approval',
            'Pending CMM Approval',
            'Pending Indenter Approval',
            'CS Approved & Forwarded to CFO',
            'HOD Approved & Forwarded to CS',
            'CFO Approved & Forwarded to GM',
            'GM Approved and Forwarded to MD',
            'HOD Approved & Forwarded to CMM',
            'CMM Approved & Forwarded to GM',
            'Indentor Approved & Forwarded to HOD',
            'HOD Approved & Forwarded to CFO',
            'HOD Approved & Forwarded to GM',
            'Indentor Approved & Forwarded to Senior Manager',
            'Senior Manager Approved &  Forwarded to HOD'
         ]]
    ]
},
{
    "dt": "Role",
    "filters": [
        ["name", "in", 
        [
            'Head of Department',
            'Company Secretary',
            'Chief Finance Officer',
            'General Manager',
            'Managing Director',
            'Indenter',
            'CMM',
            'Senior Manager'
         ]]
    ]
},
{
    "dt": "Workspace",
    "filters": [
        ["name", "in", 
        [
            'Build',
            'ERPNext Integrations',
            'Integrations',
            'ERPNext Settings',
            'Tools',
            'CRM',
            'Website',
            'Support',
            'Projects',
            'Quality',
            'Manufacturing'
         ]]
    ]
}
]