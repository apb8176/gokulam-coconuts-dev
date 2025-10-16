export const navRoutes = [    
    {   
        userType: 'property-owner',
        navItems:[
            {
                navItemLabel: 'Dashboard',
                navItemRoute: '/landing/property-owner/dashboard',
                navItemIcon: 'pi pi-home'
            },
            {
                navItemLabel: 'Profile',
                navItemRoute: '/landing/property-owner/profile',
                navItemIcon: 'pi pi-user'
            },
            {
                navItemLabel: 'Post List',
                navItemRoute: '/landing/property-owner/listing',
                navItemIcon: 'pi pi-list'
            },
            {
                navItemLabel: 'Logout',
                navItemRoute: 'bo-post-details',
                navItemIcon: 'pi pi-info-circle'
            }
        ]
    },
      {   
        userType: 'busines-owner',
        navItems:[
            {
                navItemLabel: 'Dashboard',
                navItemRoute: '/landing/busines-owner/dashboard',
                navItemIcon: 'pi pi-home'
            },
            {
                navItemLabel: 'Profile',
                navItemRoute: '/landing/busines-owner/profile',
                navItemIcon: 'pi pi-user'
            },
            {
                navItemLabel: 'Business Details',
                navItemRoute: '/landing/busines-owner/business-details',
                navItemIcon: 'pi pi-list'
            },
              {
                navItemLabel: 'Offers/Events',
                navItemRoute: '/landing/busines-owner/events',
                navItemIcon: 'pi pi-list'
            },
            
            {
                navItemLabel: 'Logout',
                navItemRoute: 'busines-owner-post-details',
                navItemIcon: 'pi pi-info-circle'
            }
        ]
    },
    
    {   
        userType: 'community-member',
        navItems:[
            {
                navItemLabel: 'Dashboard',
                navItemRoute: '/landing/community-member/dashboard',
                navItemIcon: 'pi pi-home'
            },
            {
                navItemLabel: 'Profile',
                navItemRoute: 'bo-profile',
                navItemIcon: 'pi pi-user'
            },
            {
                navItemLabel: 'Services',
                navItemRoute: 'bo-post-list',
                navItemIcon: 'pi pi-list'
            },
            {
                navItemLabel: 'Benefits',
                navItemRoute: 'bo-post-details',
                navItemIcon: 'pi pi-info-circle'
            }
        ]
    },
    {   
        userType: 'scout',
        navItems:[
            {
                navItemLabel: 'Dashboard',
                navItemRoute: '/landing/scout/dashboard',
                navItemIcon: 'pi pi-home'
            },
            {
                navItemLabel: 'Profile',
                navItemRoute: '/landing/scout/dashboard',
                navItemIcon: 'pi pi-user'
            },
            {
                navItemLabel: 'Benefits',
                navItemRoute: 'bo-post-details',
                navItemIcon: 'pi pi-info-circle'
            }
        ]
    },
     {   
        userType: 'admin',
        navItems:[
            {
                navItemLabel: 'Dashboard',
                navItemRoute: '/landing/admin/dashboard',
                navItemIcon: 'pi pi-home'
            },
            {
                navItemLabel: 'Requests',
                navItemRoute: '/landing/admin/requests',
                navItemIcon: 'pi pi-home'
            }
        ]
    }
]