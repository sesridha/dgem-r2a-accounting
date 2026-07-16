import { AppBreadcrumb } from "../shared/Breadcrumb";
import { SidebarTrigger } from "../ui/sidebar";

type BreadcrumbItem = {
  label: string;
  href?: string;
  onClick?: () => void;
};

interface JournalEntryTopNavProps {
  title?: string;
  description?: string;
  items?: BreadcrumbItem[];
  breadcrumbProps?: {
    listClassName?: string;
    itemClassName?: string;
    linkClassName?: string;
    pageClassName?: string;
    separatorClassName?: string;
  };
  variant?: "success" | "failure" | null; // for coloring the active page
}

export default function JournalEntryTopNav({
  title = "Journal Entry Configuration",
  description = "Configure parameters and inspect details before processing.",
  items = [{ label: "Home", href: "/" }, { label: "Journal Entry" }],
  breadcrumbProps,
  variant = null,
}: JournalEntryTopNavProps) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden h-9 w-9" />
        <AppBreadcrumb variant={variant} items={items} {...breadcrumbProps} />
      </div>
      <div className="mb-4 sm:mb-3 mt-4">
        <h2 className="text-[#111418] dark:text-white text-2xl font-black tracking-tight">
          {title}
        </h2>
        <p className="text-[#617589] dark:text-slate-400 text-xs sm:text-sm mt-1">
          {description}
        </p>
      </div>
    </div>
  );
}
