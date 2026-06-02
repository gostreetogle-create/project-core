import { Component, inject, signal, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';

import { AuthService } from '../core/auth.service';
import { ThemeService } from '../core/theme.service';
import { KpToastComponent } from '../shared/ui/kp-toast.component';
import { KpButtonComponent } from '../shared/ui/kp-button.component';
import { KpDrawerComponent } from '../shared/ui/kp-drawer.component';
import { KpAvatarComponent } from '../shared/ui/kp-avatar.component';
import { KpTieredMenuComponent } from '../shared/ui/kp-tiered-menu.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet, RouterLink, RouterLinkActive,
    TooltipModule,
    KpToastComponent, KpButtonComponent,
    KpDrawerComponent, KpAvatarComponent, KpTieredMenuComponent,
  ],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);

  readonly userMenuRef = viewChild<KpTieredMenuComponent>('userMenu');

  sidebarVisible = signal(true);
  mobileSidebarVisible = signal(false);
  isDark = this.themeService.isDark;
  currentUser = this.authService.currentUser;

  navItems: MenuItem[] = [
    { label: 'Главная', icon: 'pi pi-home', routerLink: '/dashboard' },
    { label: 'UI Kit', icon: 'pi pi-palette', routerLink: '/ui-kit' }
  ];

  userMenuItems: MenuItem[] = [
    { label: 'Профиль', icon: 'pi pi-user', command: () => {} },
    { label: 'Настройки', icon: 'pi pi-cog', command: () => {} },
    { separator: true },
    { label: 'Выйти', icon: 'pi pi-sign-out', command: () => this.authService.logout() }
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

  onNotificationsClick() {}

  openUserMenu(event: Event) {
    this.userMenuRef()?.toggle(event);
  }
}
