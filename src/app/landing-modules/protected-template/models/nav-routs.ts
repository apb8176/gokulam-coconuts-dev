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
                navItemRoute: 'bo-profile',
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
        userType: 'community-member',
        navItems:[
            {
                navItemLabel: 'Dashboard',
                navItemRoute: 'bo-dashboard',
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
    }
]