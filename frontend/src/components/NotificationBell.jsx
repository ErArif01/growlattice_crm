import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import api from "../api/axios";
import { formatDate } from "../utils/format";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const boxRef = useRef(null);

  async function loadNotifications() {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch {
      // Silently ignore
    }
  }

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleMarkAllRead() {
    await api.patch("/notifications/read-all");
    loadNotifications();
  }

  async function handleOpen() {
    setOpen((o) => !o);
    if (!open) loadNotifications();
  }

  return (
    <div className="relative" ref={boxRef}>
      <button
        onClick={handleOpen}
        className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-signal-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-40 w-[calc(100vw-2rem)] sm:w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-100 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 p-3.5">
            <h3 className="text-sm font-bold text-slate-900">Payment Reminders</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs font-semibold text-lattice-600 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-400">No payment reminders yet.</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`border-b border-slate-50 p-3.5 text-sm last:border-0 ${
                    n.isRead ? "text-slate-500" : "bg-lattice-50/40 font-medium text-slate-800"
                  }`}
                >
                  <p className="break-words">{n.message}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatDate(n.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}












// import { useState, useEffect, useRef } from "react";
// import { Bell } from "lucide-react";
// import api from "../api/axios";
// import { formatDate } from "../utils/format";

// export default function NotificationBell() {
//   const [open, setOpen] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const boxRef = useRef(null);

//   async function loadNotifications() {
//     try {
//       const res = await api.get("/notifications");
//       setNotifications(res.data.notifications);
//       setUnreadCount(res.data.unreadCount);
//     } catch {
//       // Silently ignore - the bell just won't update this cycle, not worth interrupting the user
//     }
//   }

//   useEffect(() => {
//     loadNotifications();
//     // Poll every 60s so new due-date reminders show up without needing a page refresh
//     const interval = setInterval(loadNotifications, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   // Close the dropdown when clicking anywhere outside it
//   useEffect(() => {
//     function handleClick(e) {
//       if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
//     }
//     document.addEventListener("mousedown", handleClick);
//     return () => document.removeEventListener("mousedown", handleClick);
//   }, []);

//   async function handleMarkAllRead() {
//     await api.patch("/notifications/read-all");
//     loadNotifications();
//   }

//   async function handleOpen() {
//     setOpen((o) => !o);
//     if (!open) loadNotifications();
//   }

//   return (
//     <div className="relative" ref={boxRef}>
//       <button
//         onClick={handleOpen}
//         className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
//         aria-label="Notifications"
//       >
//         <Bell size={20} />
//         {unreadCount > 0 && (
//           <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-signal-500 text-[10px] font-bold text-white">
//             {unreadCount > 9 ? "9+" : unreadCount}
//           </span>
//         )}
//       </button>

//       {open && (
//         <div className="absolute right-0 top-12 z-40 w-80 rounded-2xl border border-slate-100 bg-white shadow-xl">
//           <div className="flex items-center justify-between border-b border-slate-100 p-3.5">
//             <h3 className="text-sm font-bold text-slate-900">Payment Reminders</h3>
//             {unreadCount > 0 && (
//               <button onClick={handleMarkAllRead} className="text-xs font-semibold text-lattice-600 hover:underline">
//                 Mark all read
//               </button>
//             )}
//           </div>
//           <div className="max-h-80 overflow-y-auto">
//             {notifications.length === 0 ? (
//               <p className="p-6 text-center text-sm text-slate-400">No payment reminders yet.</p>
//             ) : (
//               notifications.map((n) => (
//                 <div
//                   key={n._id}
//                   className={`border-b border-slate-50 p-3.5 text-sm last:border-0 ${
//                     n.isRead ? "text-slate-500" : "bg-lattice-50/40 font-medium text-slate-800"
//                   }`}
//                 >
//                   <p>{n.message}</p>
//                   <p className="mt-1 text-xs text-slate-400">{formatDate(n.createdAt)}</p>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
