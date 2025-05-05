import {Component} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {MenuItem} from 'primeng/api';
import {Ripple} from 'primeng/ripple';
import {Badge} from 'primeng/badge';
import {Menubar} from 'primeng/menubar';
import {Avatar} from 'primeng/avatar';
import {NgClass, NgOptimizedImage} from '@angular/common';
import {InputText} from 'primeng/inputtext';

@Component({
  selector: 'app-landing-navbar',
  imports: [RouterLink, RouterLinkActive, Ripple, Badge, Menubar, Avatar, NgClass, InputText, NgOptimizedImage],
  templateUrl: './landing-navbar.component.html',
  styleUrl: './landing-navbar.component.scss'
})
export class LandingNavbarComponent implements NgOnInit {
  items: MenuItem[] | undefined;

  ngOnInit() {
      this.items = [
        {
          label: 'File',
          icon: 'pi pi-file',
          items: [
            {
              label: 'New',
              icon: 'pi pi-plus',
              items: [
                {
                  label: 'Document',
                  icon: 'pi pi-file'
                },
                {
                  label: 'Image',
                  icon: 'pi pi-image'
                },
                {
                  label: 'Video',
                  icon: 'pi pi-video'
                }
              ]
            },
            {
              label: 'Open',
              icon: 'pi pi-folder-open'
            },
            {
              label: 'Print',
              icon: 'pi pi-print'
            }
          ]
        },
        {
          label: 'Edit',
          icon: 'pi pi-file-edit',
          items: [
            {
              label: 'Copy',
              icon: 'pi pi-copy'
            },
            {
              label: 'Delete',
              icon: 'pi pi-times'
            }
          ]
        },
        {
          label: 'Search',
          icon: 'pi pi-search'
        },
        {
          separator: true
        },
        {
          label: 'Share',
          icon: 'pi pi-share-alt',
          items: [
            {
              label: 'Slack',
              icon: 'pi pi-slack'
            },
            {
              label: 'Whatsapp',
              icon: 'pi pi-whatsapp'
            }
          ]
        }
      ]
    }
    this.items = [
      {
        label: 'Home',
        icon: 'pi pi-home',
      },
      {
        label: 'Projects',
        icon: 'pi pi-search',
        badge: '3',
        items: [
          {
            label: 'Core',
            icon: 'pi pi-bolt',
            shortcut: '⌘+S',
          },
          {
            label: 'Blocks',
            icon: 'pi pi-server',
            shortcut: '⌘+B',
          },
          {
            separator: true,
          },
          {
            label: 'UI Kit',
            icon: 'pi pi-pencil',
            shortcut: '⌘+U',
          },
        ],
      },
    ];
  }
}
