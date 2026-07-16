## Icons

### Lucide React (Primary – use for ALL UI icons)

DGEM uses [Lucide React](https://lucide.dev) for all UI icons. **Never use icon fonts** (`icon2-*`, `icon-*`), Material Icons, Heroicons, Font Awesome, or any other icon library.

Install: `npm install lucide-react`

Browse icons: https://lucide.dev/icons

```tsx
// Direct import
import { Search, X, ChevronRight, Download } from "lucide-react";

<Search size={16} />
<X size={14} className="text-muted-foreground" />
<ChevronRight size={8} />
```

**Shared `<Icon>` wrapper** – when available in your app, use the centralized component:

```tsx
import { Icon } from "@/components/shared";

<Icon name="search" size={16} />
<Icon name="x" size={14} className="text-muted-foreground" />
<Icon name="chevron-right" size={8} />
```

**Sizing** – controlled via the `size` prop (number in pixels):

| Size | Use case |
|------|----------|
| 8–10 | Inline chevrons, breadcrumb separators |
| 12–14 | Button icons, table actions |
| 16 | Default / sidebar nav / toolbar |
| 20–24 | Header icons |
| 28–32 | Empty states, decorative |
| 48 | Large empty state / success feedback |

**Color** – icons inherit `currentColor` by default. Use Tailwind `className` to override:

```tsx
<Icon name="check" size={16} className="text-green-500" />
<Icon name="x" size={14} className="text-red-500" />
<Icon name="search" size={14} className="text-muted-foreground" />
```

### Icon Map Reference

The `<Icon name="..." />` wrapper maps kebab-case names to Lucide components. All names below are available out of the box.

#### Actions

| Name | Lucide component | Purpose |
|------|-----------------|---------|
| `plus` | `Plus` | Add / create |
| `pencil` | `Pencil` | Edit |
| `x` | `X` | Close / dismiss |
| `check` | `Check` | Confirm / checkmark |
| `check-circle` | `CheckCircle2` | Success feedback |
| `save` | `Save` | Save action |
| `download` | `Download` | Download |
| `upload` | `Upload` | Upload |
| `copy` | `Copy` | Copy to clipboard |
| `trash` | `Trash2` | Delete |
| `send` | `Send` | Send message |
| `share` | `Share2` | Share |
| `refresh` | `RefreshCw` | Refresh / reload |
| `rotate` | `RotateCcw` | Undo / rotate |
| `filter` | `Filter` | Filter |
| `search` | `Search` | Search |
| `ban` | `Ban` | Block / revoke |

#### Navigation

| Name | Lucide component | Purpose |
|------|-----------------|---------|
| `chevron-left` | `ChevronLeft` | Back / pagination |
| `chevron-right` | `ChevronRight` | Forward / breadcrumbs |
| `chevron-down` | `ChevronDown` | Dropdown / expand |
| `chevron-up` | `ChevronUp` | Collapse |
| `arrow-left` | `ArrowLeft` | Navigate left |
| `arrow-right` | `ArrowRight` | Navigate right |
| `arrow-up` | `ArrowUp` | Navigate up |
| `arrow-down` | `ArrowDown` | Navigate down |
| `arrow-up-down` | `ArrowUpDown` | Sort toggle |
| `external-link` | `ExternalLink` | Open in new tab |
| `home` | `Home` | Home page |
| `panel-left` | `PanelLeft` | Left sidebar |
| `panel-right` | `PanelRight` | Right sidebar |

#### Users & Auth

| Name | Lucide component | Purpose |
|------|-----------------|---------|
| `user` | `User` | User / person |
| `users` | `Users` | User group |
| `user-plus` | `UserPlus` | Add user |
| `user-minus` | `UserMinus` | Remove user |
| `user-check` | `UserCheck` | Verified user |
| `log-in` | `LogIn` | Login / sign in |
| `log-out` | `LogOut` | Logout / sign out |

#### Files & Folders

| Name | Lucide component | Purpose |
|------|-----------------|---------|
| `folder` | `Folder` | Folder |
| `folder-open` | `FolderOpen` | Open folder |
| `folders` | `Folders` | Projects |
| `file-text` | `FileText` | Document |
| `clipboard` | `Clipboard` | Clipboard |
| `clipboard-list` | `ClipboardList` | Audit log |
| `clipboard-check` | `ClipboardCheck` | Checklist |

#### Data & Analytics

| Name | Lucide component | Purpose |
|------|-----------------|---------|
| `bar-chart-2` | `BarChart2` | Analytics |
| `bar-chart-3` | `BarChart3` | Usage charts |
| `trending-up` | `TrendingUp` | Trending up |
| `trending-down` | `TrendingDown` | Trending down |
| `activity` | `Activity` | Ops health |
| `flame` | `Flame` | Hot / trending |
| `layers` | `Layers` | Stacking / layers |

#### Lists

| Name | Lucide component | Purpose |
|------|-----------------|---------|
| `list` | `List` | Generic list |
| `list-checks` | `ListChecks` | Checklist |
| `list-filter` | `ListFilter` | Filtered list |
| `list-ordered` | `ListOrdered` | Numbered list |

#### Communication

| Name | Lucide component | Purpose |
|------|-----------------|---------|
| `mail` | `Mail` | Email |
| `message-circle` | `MessageCircle` | Chat message |
| `message-square` | `MessageSquare` | Message box |
| `bell` | `Bell` | Alerts / notifications |
| `bell-off` | `BellOff` | Mute notifications |

#### Status & Feedback

| Name | Lucide component | Purpose |
|------|-----------------|---------|
| `info` | `Info` | Info / help |
| `alert-circle` | `AlertCircle` | Error / warning |
| `alert-triangle` | `AlertTriangle` | Warning |
| `circle-x` | `CircleX` | Error circle |
| `circle-dot` | `CircleDot` | Radio / status |

#### AI & Agents

| Name | Lucide component | Purpose |
|------|-----------------|---------|
| `bot` | `Bot` | AI agent |
| `brain-circuit` | `BrainCircuit` | AI / ML |
| `sparkles` | `Sparkles` | AI magic |
| `wand` | `Wand2` | Magic / auto |
| `zap` | `Zap` | Performance / fast |

#### Media Controls (Agent Lifecycle)

| Name | Lucide component | Purpose |
|------|-----------------|---------|
| `play` | `Play` | Start / activate |
| `pause` | `Pause` | Pause |
| `stop` | `Square` | Stop |
| `power` | `Power` | Power on/off |

#### Infrastructure & Cloud

| Name | Lucide component | Purpose |
|------|-----------------|---------|
| `cloud` | `Cloud` | Providers |
| `cloud-backup` | `CloudBackup` | Fallback / backup |
| `server` | `Server` | Server |
| `database` | `Database` | Database |
| `network` | `Network` | Network |
| `globe` | `Globe` | Internet / global |
| `wifi` | `Wifi` | Connected |
| `wifi-off` | `WifiOff` | Disconnected |
| `monitor` | `Monitor` | Display / screen |
| `terminal` | `Terminal` | Terminal / CLI |

#### Security & Keys

| Name | Lucide component | Purpose |
|------|-----------------|---------|
| `key` | `Key` | API keys |
| `key-round` | `KeyRound` | API keys (round) |
| `lock` | `Lock` | Locked |
| `unlock` | `Unlock` | Unlocked |
| `shield` | `Shield` | Security |
| `shield-alert` | `ShieldAlert` | Security warning |
| `shield-check` | `ShieldCheck` | Security verified |

#### Business & Finance

| Name | Lucide component | Purpose |
|------|-----------------|---------|
| `credit-card` | `CreditCard` | Payment / pricing |
| `coins` | `Coins` | Cost / pricing |
| `wallet` | `Wallet` | Budget |
| `briefcase` | `Briefcase` | Business / project |
| `building` | `Building` | Organization |
| `scale` | `Scale` | Scaling |

#### Time

| Name | Lucide component | Purpose |
|------|-----------------|---------|
| `calendar` | `Calendar` | Date picker |
| `clock` | `Clock` | Time |
| `history` | `History` | History / audit |
| `timer` | `Timer` | Timer / duration |

#### Code & Dev

| Name | Lucide component | Purpose |
|------|-----------------|---------|
| `code` | `Code` | Developer / API |
| `bug` | `Bug` | Bug / debugging |
| `wrench` | `Wrench` | Tools |
| `settings` | `Settings` | Settings |
| `settings-2` | `Settings2` | Settings alt |
| `sliders` | `Sliders` | Adjustments |
| `hash` | `Hash` | ID / number |

#### Layout & UI

| Name | Lucide component | Purpose |
|------|-----------------|---------|
| `layout-dashboard` | `LayoutDashboard` | Dashboard |
| `eye` | `Eye` | Preview / view |
| `eye-off` | `EyeOff` | Hide |
| `grip-vertical` | `GripVertical` | Drag handle |
| `more-horizontal` | `MoreHorizontal` | More actions |
| `more-vertical` | `MoreVertical` | More actions |
| `toggle-left` | `ToggleLeft` | Toggle off |
| `toggle-right` | `ToggleRight` | Toggle on |
| `slash` | `Slash` | Separator |
| `link` | `Link` | Link |
| `link-off` | `Link2Off` | Unlink |

#### Misc

| Name | Lucide component | Purpose |
|------|-----------------|---------|
| `archive` | `Archive` | Archive |
| `bookmark` | `Bookmark` | Bookmark |
| `heart` | `Heart` | Favorite |
| `star` | `Star` | Rating / favorite |
| `tag` | `Tag` | Tag / label |
| `tags` | `Tags` | Multiple tags |
| `image` | `Image` | Image |
| `sun` | `Sun` | Light mode |
| `moon` | `Moon` | Dark mode |

### Spinners / Loading

There is no spinner icon. Use a **CSS-only spinner**:

```html
<span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
```

Scale with `h-*` / `w-*` classes. Color inherits from `border-current`.

### Content/Illustration Icons

49 SVG illustrations available in `@dgem/design-system/assets/icons/`:

```javascript
import automationIcon from '@dgem/design-system/assets/icons/icon-1.svg'
```

Used for: card illustrations, empty states, landing page visuals. These are **not** for inline UI – use Lucide React for that.

### Icon Rules

1. **Use Lucide React (`lucide-react`) for ALL UI icons** – buttons, headers, nav, modals, toasts, pagination, forms.
2. **Never use icon fonts** (`icon2-*`, `icon-*`) or Material Icons – these are deprecated.
3. **Never import alternative icon libraries** (Heroicons, Font Awesome, Phosphor, etc.).
4. **Content/illustration icons** (larger, decorative) come from the SVG files in `@dgem/design-system/assets/icons/`.
5. Size icons via the `size` prop (number in px).
6. Color icons via Tailwind `className` utilities (`text-green-500`, `text-red-500`, etc.) – Lucide icons use `currentColor`.
7. Browse available icons at https://lucide.dev/icons
