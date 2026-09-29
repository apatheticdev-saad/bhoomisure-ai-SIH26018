"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  Database,
  ShieldCheck,
  GitCompare,
  MapPinned,
  FileText,
  ClipboardList,
  LockKeyhole,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const workspaceItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Upload Document",
    href: "/upload",
    icon: Upload,
  },
  {
    label: "Land Records",
    href: "/records",
    icon: Database,
  },
  {
    label: "Verification Queue",
    href: "/verification",
    icon: ShieldCheck,
  },
  {
    label: "Reconciliation",
    href: "/reconciliation/3",
    icon: GitCompare,
  },
  {
    label: "Parcel Intelligence",
    href: "/map",
    icon: MapPinned,
  },
  {
    label: "Reports",
    href: "/reports/1",
    icon: FileText,
  },
];

const systemItems = [
  {
    label: "Audit Trail",
    href: "/audit",
    icon: ClipboardList,
  },
  {
    label: "Integrity & Health",
    href: "/integrity",
    icon: LockKeyhole,
  },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(
      href.replace(/\/\d+$/, "")
    );
  };

  const closeMobile = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* ================================================= */}
      {/* MOBILE TOP BAR */}
      {/* ================================================= */}

      <div className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-[#12395b] px-4 text-white lg:hidden">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center border border-white/20 bg-white/10">
            <ShieldCheck size={19} />
          </div>

          <div>
            <p className="text-[9px] font-bold tracking-[0.16em] text-blue-100">
              BHOOMISURE AI
            </p>

            <p className="text-sm font-bold">
              Land Records Portal
            </p>
          </div>

        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="border border-white/20 p-2 text-white"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? (
            <X size={20} />
          ) : (
            <Menu size={20} />
          )}
        </button>

      </div>

      {/* ================================================= */}
      {/* MOBILE OVERLAY */}
      {/* ================================================= */}

      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
        />
      )}

      {/* ================================================= */}
      {/* SIDEBAR */}
      {/* ================================================= */}

      <aside
        className={`
          fixed
          bottom-0
          left-0
          top-0
          z-50
          flex
          w-[270px]
          flex-col
          border-r
          border-[#d5dce2]
          bg-white
          transition-transform
          duration-200
          lg:translate-x-0
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* ================================================= */}
        {/* TRICOLOR TOP STRIP */}
        {/* ================================================= */}

        <div className="flex h-1">
          <div className="w-1/3 bg-[#e67e22]" />
          <div className="w-1/3 bg-white" />
          <div className="w-1/3 bg-[#138a4b]" />
        </div>

        {/* ================================================= */}
        {/* BRAND HEADER */}
        {/* ================================================= */}

        <div className="border-b border-slate-200 bg-[#12395b] px-5 py-5 text-white">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center border border-white/20 bg-white/10">
              <ShieldCheck size={23} />
            </div>

            <div>

              <p className="text-[11px] font-bold tracking-[0.16em]">
                BHOOMISURE AI
              </p>

              <p className="mt-1 text-[13px] font-medium text-blue-100">
                Land Records Portal
              </p>

            </div>

          </div>

          <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3">

            <span className="h-2 w-2 rounded-full bg-green-400" />

            <span className="text-[10px] font-medium text-blue-100">
              SIH 2026 • Prototype
            </span>

          </div>

        </div>

        {/* ================================================= */}
        {/* NAVIGATION */}
        {/* ================================================= */}

        <nav className="flex-1 overflow-y-auto px-3 py-6">

          {/* WORKSPACE */}

          <NavSection title="WORKSPACE">

            {workspaceItems.map((item) => (
              <SidebarItem
                key={item.href}
                {...item}
                active={isActive(item.href)}
                onClick={closeMobile}
              />
            ))}

          </NavSection>

          {/* DIVIDER */}

          <div className="my-6 border-t border-slate-200" />

          {/* SYSTEM */}

          <NavSection title="SYSTEM & GOVERNANCE">

            {systemItems.map((item) => (
              <SidebarItem
                key={item.href}
                {...item}
                active={isActive(item.href)}
                onClick={closeMobile}
              />
            ))}

          </NavSection>

        </nav>

        {/* ================================================= */}
        {/* BOTTOM SYSTEM INFORMATION */}
        {/* ================================================= */}

        <div className="border-t border-slate-200 bg-[#f8fafc] p-4">

          <div className="border border-slate-200 bg-white p-3">

            <div className="flex items-center gap-3">

              <div className="flex h-8 w-8 items-center justify-center bg-[#edf5fb] text-[#1769aa]">
                <ShieldCheck size={15} />
              </div>

              <div>

                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  System Status
                </p>

                <div className="mt-1 flex items-center gap-2">

                  <span className="h-1.5 w-1.5 rounded-full bg-[#238b57]" />

                  <p className="text-[10px] font-semibold text-[#238b57]">
                    Operational
                  </p>

                </div>

              </div>

            </div>

          </div>

          <p className="mt-3 text-center text-[9px] text-slate-400">
            StackPulse • BhoomiSure AI
          </p>

        </div>

      </aside>
    </>
  );
}


/* ========================================================= */
/* NAVIGATION SECTION */
/* ========================================================= */

function NavSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>

      <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
        {title}
      </p>

      <div className="space-y-0.5">
        {children}
      </div>

    </div>
  );
}


/* ========================================================= */
/* SIDEBAR ITEM */
/* ========================================================= */

function SidebarItem({
  label,
  href,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  href: string;
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        group
        relative
        flex
        items-center
        gap-3
        border-l-[3px]
        px-3
        py-2.5
        text-[12px]
        font-medium
        transition
        ${
          active
            ? "border-[#1769aa] bg-[#edf5fb] text-[#12395b]"
            : "border-transparent text-slate-600 hover:bg-[#f5f7f9] hover:text-[#12395b]"
        }
      `}
    >

      {/* ICON */}

      <div
        className={`
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          ${
            active
              ? "bg-[#1769aa] text-white"
              : "bg-[#f1f4f6] text-slate-500 group-hover:bg-[#e8eef3] group-hover:text-[#1769aa]"
          }
        `}
      >
        <Icon size={16} />
      </div>

      {/* LABEL */}

      <span className="flex-1">
        {label}
      </span>

      {/* ACTIVE INDICATOR */}

      {active && (
        <ChevronRight
          size={14}
          className="text-[#1769aa]"
        />
      )}

    </Link>
  );
}



// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   LayoutDashboard,
//   Upload,
//   Database,
//   ShieldCheck,
//   GitCompare,
//   MapPinned,
//   FileText,
//   ClipboardList,
//   LockKeyhole,
//   Menu,
//   X,
//   ChevronRight,
// } from "lucide-react";
// import { useState } from "react";

// const workspaceItems = [
//   {
//     label: "Dashboard",
//     href: "/",
//     icon: LayoutDashboard,
//   },
//   {
//     label: "Upload Document",
//     href: "/upload",
//     icon: Upload,
//   },
//   {
//     label: "Land Records",
//     href: "/records",
//     icon: Database,
//   },
//   {
//     label: "Verification Queue",
//     href: "/verification",
//     icon: ShieldCheck,
//   },
//   {
//     label: "Reconciliation",
//     href: "/reconciliation/3",
//     icon: GitCompare,
//   },
//    {
//     label: "Parcel Intelligence",
//     href: "/map",
//     icon: MapPinned,
//   },
//   {
//   label: "Reports",
//   href: "/reports/1",
//   icon: FileText,
// },
// ];

// const systemItems = [
//   {
//     label: "Audit Trail",
//     href: "/audit",
//     icon: ClipboardList,
//   },
//   {
//     label: "Integrity & Health",
//     href: "/integrity",
//     icon: LockKeyhole,
//   },
// ];

// export default function AppSidebar() {
//   const pathname = usePathname();
//   const [mobileOpen, setMobileOpen] = useState(false);

//   const isActive = (href: string) => {
//     if (href === "/") {
//       return pathname === "/";
//     }

//     return pathname.startsWith(
//       href.replace(/\/\d+$/, "")
//     );
//   };

//   const closeMobile = () => {
//     setMobileOpen(false);
//   };

//   return (
//     <>
//       {/* Mobile top bar */}
//       <div className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">

//         <div className="flex items-center gap-3">

//           <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
//             <ShieldCheck size={19} />
//           </div>

//           <div>
//             <p className="text-[9px] font-bold tracking-[0.16em] text-blue-600">
//               BHOOMISURE AI
//             </p>

//             <p className="text-sm font-bold text-slate-800">
//               Land Intelligence
//             </p>
//           </div>

//         </div>

//         <button
//           onClick={() =>
//             setMobileOpen(!mobileOpen)
//           }
//           className="rounded-lg border border-slate-200 p-2 text-slate-600"
//         >
//           {mobileOpen ? (
//             <X size={20} />
//           ) : (
//             <Menu size={20} />
//           )}
//         </button>

//       </div>

//       {/* Mobile overlay */}
//       {mobileOpen && (
//         <button
//           aria-label="Close navigation"
//           onClick={closeMobile}
//           className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
//         />
//       )}

//       {/* Sidebar */}
//       <aside
//         className={`
//           fixed
//           bottom-0
//           left-0
//           top-0
//           z-50
//           flex
//           w-[260px]
//           flex-col
//           border-r
//           border-slate-200
//           bg-white
//           transition-transform
//           duration-200
//           lg:translate-x-0
//           ${
//             mobileOpen
//               ? "translate-x-0"
//               : "-translate-x-full"
//           }
//         `}
//       >

//         {/* Brand */}
//         <div className="flex h-[82px] items-center border-b border-slate-100 px-6">

//           <div className="flex items-center gap-3">

//             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
//               <ShieldCheck size={21} />
//             </div>

//             <div>
//               <p className="text-[10px] font-bold tracking-[0.18em] text-blue-600">
//                 BHOOMISURE AI
//               </p>

//               <p className="mt-0.5 text-[15px] font-bold tracking-tight text-slate-800">
//                 Land Intelligence
//               </p>
//             </div>

//           </div>

//         </div>

//         {/* Navigation */}
//         <nav className="flex-1 overflow-y-auto px-4 py-6">

//           <NavSection title="WORKSPACE">

//             {workspaceItems.map((item) => (
//               <SidebarItem
//                 key={item.href}
//                 {...item}
//                 active={isActive(item.href)}
//                 onClick={closeMobile}
//               />
//             ))}

//           </NavSection>

//           <div className="my-7 border-t border-slate-100" />

//           <NavSection title="SYSTEM">

//             {systemItems.map((item) => (
//               <SidebarItem
//                 key={item.href}
//                 {...item}
//                 active={isActive(item.href)}
//                 onClick={closeMobile}
//               />
//             ))}

//           </NavSection>

//         </nav>

//         {/* Bottom information */}
//         <div className="border-t border-slate-100 p-4">

//           <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">

//             <div className="flex items-center gap-2">

//               <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
//                 <ShieldCheck size={15} />
//               </div>

//               <div>
//                 <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
//                   Environment
//                 </p>

//                 <p className="text-xs font-semibold text-slate-700">
//                   SIH 2026 Prototype
//                 </p>
//               </div>

//             </div>

//             <div className="mt-3 flex items-center gap-2">

//               <span className="h-2 w-2 rounded-full bg-emerald-500" />

//               <span className="text-[10px] font-medium text-slate-500">
//                 System operational
//               </span>

//             </div>

//           </div>

//           <p className="mt-3 text-center text-[9px] text-slate-400">
//             StackPulse • BhoomiSure AI
//           </p>

//         </div>

//       </aside>
//     </>
//   );
// }

// /* -------------------------------- */
// /* Navigation helpers */
// /* -------------------------------- */

// function NavSection({
//   title,
//   children,
// }: {
//   title: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <div>

//       <p className="mb-2 px-3 text-[9px] font-bold tracking-[0.18em] text-slate-400">
//         {title}
//       </p>

//       <div className="space-y-1">
//         {children}
//       </div>

//     </div>
//   );
// }

// function SidebarItem({
//   label,
//   href,
//   icon: Icon,
//   active,
//   onClick,
// }: {
//   label: string;
//   href: string;
//   icon: React.ElementType;
//   active: boolean;
//   onClick: () => void;
// }) {
//   return (
//     <Link
//       href={href}
//       onClick={onClick}
//       className={`
//         group
//         flex
//         items-center
//         gap-3
//         rounded-xl
//         px-3
//         py-2.5
//         text-sm
//         font-medium
//         transition
//         ${
//           active
//             ? "bg-blue-50 text-blue-700"
//             : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
//         }
//       `}
//     >

//       <div
//         className={`
//           flex
//           h-8
//           w-8
//           items-center
//           justify-center
//           rounded-lg
//           transition
//           ${
//             active
//               ? "bg-blue-600 text-white shadow-sm"
//               : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
//           }
//         `}
//       >
//         <Icon size={16} />
//       </div>

//       <span className="flex-1">
//         {label}
//       </span>

//       {active && (
//         <ChevronRight
//           size={14}
//           className="text-blue-500"
//         />
//       )}

//     </Link>
//   );
// }