import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ThemeService } from '../core/theme.service';
import { KpToastComponent } from '../shared/ui/kp-toast.component';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet, RouterLink, RouterLinkActive,
    KpToastComponent,
    DrawerModule, ButtonModule, AvatarModule, MenuModule, TieredMenuModule, TooltipModule
  ],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);

  sidebarVisible = signal(true);
  mobileSidebarVisible = signal(false);
  isDark = this.themeService.isDark;
  currentUser = this.authService.currentUser;

  navItems: MenuItem[] = [
    { label: 'Главная', icon: 'pi pi-home', routerLink: '/dashboard' },
    { label: 'UI Kit', icon: 'pi pi-palette', routerLink: '/ui-kit' }
  ];

  userMenuItems: MenuItem[] = [
    {
      label: 'Профиль',
      icon: 'pi pi-user',
      command: () => {}
    },
    {
      label: 'Настройки',
      icon: 'pi pi-cog',
      command: () => {}
    },
    { separator: true },
    {
      label: 'Выйти',
      icon: 'pi pi-sign-out',
      command: () => this.authService.logout()
    }
  ];

  toggleSidebar() {
    this.sidebarVisible.update(v => !v);
  }

  toggleMobileSidebar() {
    this.mobileSidebarVisible.update(v => !v);
  }

  toggleTheme() {
    this.themeService.toggle();
  }

  onNotificationsClick() {
    // TODO: открыть список уведомлений
  }
}
