import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, UserPlus, LogOut, FolderPlus, Wallet, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import ProjectModal from "./ProjectModal";
import PaymentModal from "./PaymentModal";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/leads", label: "Leads", icon: UserPlus },
  { to: "/customers", label: "Customers", icon: Users },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [quickProjectOpen, setQuickProjectOpen] = useState(false);
  const [quickPaymentOpen, setQuickPaymentOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [navigate]);

  function handleQuickSaved(customerId) {
    setQuickProjectOpen(false);
    setQuickPaymentOpen(false);
    if (customerId) navigate(`/customers/${customerId}`);
    setIsMobileMenuOpen(false);
  }

  // Sidebar content (shared between desktop and mobile)
  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-2.5 px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-lattice-700">
          <span className="font-display text-sm font-bold text-white sm:text-base">G</span>
        </div>
        <div className="hidden sm:block">
          <p className="font-display text-sm font-bold leading-none text-slate-900">GrowLattice</p>
          <p className="text-xs text-slate-400">CRM</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-2 sm:px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-lattice-700 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-slate-100 px-2 py-3 sm:px-3">
        <p className="hidden sm:block px-3.5 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Quick Actions
        </p>
        <button
          onClick={() => setQuickProjectOpen(true)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 active:bg-slate-100 touch-manipulation"
        >
          <FolderPlus size={18} className="flex-shrink-0" />
          <span className="truncate">Add Project</span>
        </button>
        <button
          onClick={() => setQuickPaymentOpen(true)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 active:bg-slate-100 touch-manipulation"
        >
          <Wallet size={18} className="flex-shrink-0" />
          <span className="truncate">Add Payment</span>
        </button>
      </div>

      <div className="border-t border-slate-100 p-3">
        <div className="mb-2 flex items-center gap-2.5 rounded-xl px-2 py-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-lattice-100 text-xs font-bold text-lattice-700">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{user?.name}</p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 touch-manipulation"
        >
          <LogOut size={18} className="flex-shrink-0" />
          <span className="truncate">Log out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 flex-col border-r border-slate-100 bg-white">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-50 h-full w-72 transform bg-white transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-lattice-700">
                <span className="font-display text-sm font-bold text-white">G</span>
              </div>
              <div>
                <p className="font-display text-sm font-bold leading-none text-slate-900">GrowLattice</p>
                <p className="text-xs text-slate-400">CRM</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 touch-manipulation"
            >
              <X size={20} />
            </button>
          </div>
          <SidebarContent />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden w-full">
        <header className="flex items-center justify-between border-b border-slate-100 bg-white px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-3.5">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 md:hidden touch-manipulation"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <NotificationBell />
        </header>
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {quickProjectOpen && (
        <ProjectModal onClose={() => setQuickProjectOpen(false)} onSaved={handleQuickSaved} />
      )}

      {quickPaymentOpen && (
        <PaymentModal onClose={() => setQuickPaymentOpen(false)} onSaved={handleQuickSaved} />
      )}
    </div>
  );
}










// import { NavLink, Outlet } from "react-router-dom";
// import { LayoutDashboard, Users, UserPlus, LogOut, Menu, X } from "lucide-react";
// import { useAuth } from "../context/AuthContext";
// import NotificationBell from "./NotificationBell";
// import { useState } from "react";

// const NAV_ITEMS = [
//   { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
//   { to: "/leads", label: "Leads", icon: UserPlus },
//   { to: "/customers", label: "Customers", icon: Users },
// ];

// export default function Layout() {
//   const { user, logout } = useAuth();
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   return (
//     <div className="flex h-screen bg-slate-50">
//       {/* Mobile overlay */}
//       {sidebarOpen && (
//         <div 
//           className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden" 
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <aside className={`
//         fixed inset-y-0 left-0 z-50 flex w-64 flex-shrink-0 flex-col border-r border-slate-100 bg-white 
//         transition-transform duration-300 ease-in-out
//         lg:relative lg:translate-x-0
//         ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
//       `}>
//         <div className="flex items-center justify-between px-6 py-6">
//           <div className="flex items-center gap-2.5">
//             <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lattice-700">
//               <span className="font-display text-base font-bold text-white">G</span>
//             </div>
//             <div>
//               <p className="font-display text-sm font-bold leading-none text-slate-900">GrowLattice</p>
//               <p className="text-xs text-slate-400">CRM</p>
//             </div>
//           </div>
//           <button 
//             onClick={() => setSidebarOpen(false)} 
//             className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
//           {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
//             <NavLink
//               key={to}
//               to={to}
//               end={end}
//               onClick={() => setSidebarOpen(false)}
//               className={({ isActive }) =>
//                 `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
//                   isActive
//                     ? "bg-lattice-700 text-white shadow-sm"
//                     : "text-slate-600 hover:bg-slate-50"
//                 }`
//               }
//             >
//               <Icon size={18} />
//               {label}
//             </NavLink>
//           ))}
//         </nav>

//         <div className="border-t border-slate-100 p-3">
//           <div className="mb-2 flex items-center gap-2.5 rounded-xl px-2 py-2">
//             <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-lattice-100 text-xs font-bold text-lattice-700">
//               {user?.name?.charAt(0)?.toUpperCase() || "U"}
//             </div>
//             <div className="min-w-0 flex-1">
//               <p className="truncate text-sm font-semibold text-slate-800">{user?.name}</p>
//               <p className="truncate text-xs text-slate-400">{user?.email}</p>
//             </div>
//           </div>
//           <button
//             onClick={logout}
//             className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
//           >
//             <LogOut size={18} />
//             Log out
//           </button>
//         </div>
//       </aside>

//       {/* Main content */}
//       <div className="flex flex-1 flex-col overflow-hidden">
//         <header className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3.5 md:px-6">
//           <button 
//             onClick={() => setSidebarOpen(true)} 
//             className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
//           >
//             <Menu size={22} />
//           </button>
//           <div className="flex items-center gap-3 ml-auto">
//             <NotificationBell />
//           </div>
//         </header>
//         <main className="flex-1 overflow-y-auto p-4 md:p-6">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// }













// // import { NavLink, Outlet } from "react-router-dom";
// // import { LayoutDashboard, Users, UserPlus, LogOut } from "lucide-react";
// // import { useAuth } from "../context/AuthContext";
// // import NotificationBell from "./NotificationBell";

// // const NAV_ITEMS = [
// //   { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
// //   { to: "/leads", label: "Leads", icon: UserPlus },
// //   { to: "/customers", label: "Customers", icon: Users },
// // ];

// // export default function Layout() {
// //   const { user, logout } = useAuth();

// //   return (
// //     <div className="flex h-screen bg-slate-50">
// //       {/* Sidebar */}
// //       <aside className="flex w-64 flex-shrink-0 flex-col border-r border-slate-100 bg-white">
// //         <div className="flex items-center gap-2.5 px-6 py-6">
// //           <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lattice-700">
// //             <span className="font-display text-base font-bold text-white">G</span>
// //           </div>
// //           <div>
// //             <p className="font-display text-sm font-bold leading-none text-slate-900">GrowLattice</p>
// //             <p className="text-xs text-slate-400">CRM</p>
// //           </div>
// //         </div>

// //         <nav className="flex-1 space-y-1 px-3">
// //           {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
// //             <NavLink
// //               key={to}
// //               to={to}
// //               end={end}
// //               className={({ isActive }) =>
// //                 `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
// //                   isActive
// //                     ? "bg-lattice-700 text-white shadow-sm"
// //                     : "text-slate-600 hover:bg-slate-50"
// //                 }`
// //               }
// //             >
// //               <Icon size={18} />
// //               {label}
// //             </NavLink>
// //           ))}
// //         </nav>

// //         <div className="border-t border-slate-100 p-3">
// //           <div className="mb-2 flex items-center gap-2.5 rounded-xl px-2 py-2">
// //             <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lattice-100 text-xs font-bold text-lattice-700">
// //               {user?.name?.charAt(0)?.toUpperCase() || "U"}
// //             </div>
// //             <div className="min-w-0">
// //               <p className="truncate text-sm font-semibold text-slate-800">{user?.name}</p>
// //               <p className="truncate text-xs text-slate-400">{user?.email}</p>
// //             </div>
// //           </div>
// //           <button
// //             onClick={logout}
// //             className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
// //           >
// //             <LogOut size={18} />
// //             Log out
// //           </button>
// //         </div>
// //       </aside>

// //       {/* Main content */}
// //       <div className="flex flex-1 flex-col overflow-hidden">
// //         <header className="flex items-center justify-end border-b border-slate-100 bg-white px-6 py-3.5">
// //           <NotificationBell />
// //         </header>
// //         <main className="flex-1 overflow-y-auto p-6">
// //           <Outlet />
// //         </main>
// //       </div>
// //     </div>
// //   );
// // }
