"use client";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import StatCard from "@/components/cards/stat-card";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FileText,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Search,
  ExternalLink,
  Eye,
  X,
  RefreshCw,
  Filter,
  ArrowUpDown,
  CalendarDays,
} from "lucide-react";

import {
  Plus_Jakarta_Sans,
} from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: [
    "400",
    "500",
    "600",
    "700",
    "800",
  ],
});

interface DocumentItem {
  Date: string;
  "Document Type": string;
  "Document Number": string;
  Title: string;
  "Requested By": string;
  Approver: string;
  Status: string;
  Priority: string;
  "Draft Link": string;
  "Signed Link": string;
  Remarks: string;
  "Last Update": string;
}

const STATUS_COLORS: Record<string, string> = {
  Draft:
    "bg-slate-100 text-slate-700 border-slate-200",

  "Finance Check":
    "bg-yellow-50 text-yellow-700 border-yellow-200",

  Revision:
    "bg-orange-50 text-orange-700 border-orange-200",

  "Approval Ezra":
    "bg-blue-50 text-blue-700 border-blue-200",

  "Approval Finance":
    "bg-cyan-50 text-cyan-700 border-cyan-200",

  Process:
    "bg-purple-50 text-purple-700 border-purple-200",

  Completed:
    "bg-green-50 text-green-700 border-green-200",

  Rejected:
    "bg-red-50 text-red-700 border-red-200",

  Archived:
    "bg-slate-100 text-slate-500 border-slate-200",
};

const PRIORITY_COLORS: Record<string, string> = {
  Low:
    "bg-green-50 text-green-700 border-green-200",

  Medium:
    "bg-yellow-50 text-yellow-700 border-yellow-200",

  High:
    "bg-orange-50 text-orange-700 border-orange-200",

  Urgent:
    "bg-red-50 text-red-700 border-red-200",
};

function getStatusClass(status: string) {
  return (
    STATUS_COLORS[status] ||
    "bg-slate-100 text-slate-600 border-slate-200"
  );
}

function getPriorityClass(priority: string) {
  return (
    PRIORITY_COLORS[priority] ||
    "bg-slate-100 text-slate-600 border-slate-200"
  );
}

export default function InternalDocumentsPage() {
  const [documents, setDocuments] = useState<
    DocumentItem[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedStatus, setSelectedStatus] =
    useState("All");

  const [selectedType, setSelectedType] =
    useState("All");

  const [selectedPriority, setSelectedPriority] =
    useState("All");

  const [sortBy, setSortBy] =
    useState("latest");

  const [selectedDocument, setSelectedDocument] =
    useState<DocumentItem | null>(null);

  async function fetchDocuments(
    showRefresh = false
  ) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(
        "https://opensheet.elk.sh/1e0senJvlGjTWxaOlAzcuocyjjlc_6EVWZ69u0cZX_Ig/DOCUMENT_TRACKER",
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch documents"
        );
      }

      const data =
        await response.json();

      if (Array.isArray(data)) {
        setDocuments(data);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error(
        "Document fetch failed:",
        error
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchDocuments();

    const interval =
      setInterval(() => {
        fetchDocuments();
      }, 60000);

    return () =>
      clearInterval(interval);
  }, []);

  const statusOptions = useMemo(() => {
    const values = documents
      .map((doc) => doc.Status)
      .filter(Boolean);

    return [
      "All",
      ...Array.from(
        new Set(values)
      ),
    ];
  }, [documents]);

  const typeOptions = useMemo(() => {
    const values = documents
      .map(
        (doc) =>
          doc["Document Type"]
      )
      .filter(Boolean);

    return [
      "All",
      ...Array.from(
        new Set(values)
      ),
    ];
  }, [documents]);

  const priorityOptions = useMemo(() => {
    const values = documents
      .map((doc) => doc.Priority)
      .filter(Boolean);

    return [
      "All",
      ...Array.from(
        new Set(values)
      ),
    ];
  }, [documents]);

  const analytics = useMemo(() => {
    const completed =
      documents.filter(
        (doc) =>
          doc.Status === "Completed"
      ).length;

    const pending =
      documents.filter(
        (doc) =>
          doc.Status !==
            "Completed" &&
          doc.Status !==
            "Archived"
      ).length;

    const urgent =
      documents.filter(
        (doc) =>
          doc.Priority ===
          "Urgent"
      ).length;

    const rejected =
      documents.filter(
        (doc) =>
          doc.Status ===
          "Rejected"
      ).length;

    return {
      total: documents.length,
      completed,
      pending,
      urgent,
      rejected,
    };
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    const search =
      searchTerm
        .trim()
        .toLowerCase();

    const filtered =
      documents.filter(
        (doc) => {
          const matchesSearch =
            !search ||
            doc.Title?.toLowerCase().includes(
              search
            ) ||
            doc[
              "Document Number"
            ]
              ?.toLowerCase()
              .includes(search) ||
            doc[
              "Document Type"
            ]
              ?.toLowerCase()
              .includes(search) ||
            doc[
              "Requested By"
            ]
              ?.toLowerCase()
              .includes(search) ||
            doc.Approver?.toLowerCase().includes(
              search
            );

          const matchesStatus =
            selectedStatus ===
              "All" ||
            doc.Status ===
              selectedStatus;

          const matchesType =
            selectedType ===
              "All" ||
            doc[
              "Document Type"
            ] === selectedType;

          const matchesPriority =
            selectedPriority ===
              "All" ||
            doc.Priority ===
              selectedPriority;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesType &&
            matchesPriority
          );
        }
      );

    return [...filtered].sort(
      (a, b) => {
        if (sortBy === "priority") {
          const priorityRank: Record<
            string,
            number
          > = {
            Urgent: 4,
            High: 3,
            Medium: 2,
            Low: 1,
          };

          return (
            (priorityRank[
              b.Priority
            ] || 0) -
            (priorityRank[
              a.Priority
            ] || 0)
          );
        }

        if (sortBy === "status") {
          return (
            a.Status.localeCompare(
              b.Status
            )
          );
        }

        if (sortBy === "title") {
          return (
            a.Title || ""
          ).localeCompare(
            b.Title || ""
          );
        }

        return (
          new Date(
            b["Last Update"] ||
              b.Date ||
              ""
          ).getTime() -
          new Date(
            a["Last Update"] ||
              a.Date ||
              ""
          ).getTime()
        );
      }
    );
  }, [
    documents,
    searchTerm,
    selectedStatus,
    selectedType,
    selectedPriority,
    sortBy,
  ]);

  const hasActiveFilters =
    searchTerm ||
    selectedStatus !== "All" ||
    selectedType !== "All" ||
    selectedPriority !== "All";

  function clearFilters() {
    setSearchTerm("");
    setSelectedStatus("All");
    setSelectedType("All");
    setSelectedPriority("All");
  }

  return (
    <div
      className={`${jakarta.className} flex min-h-screen overflow-x-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100`}
    >
      <Sidebar />

      <main className="min-w-0 flex-1 p-4 lg:p-6">
        <Topbar
          title="Internal Documents"
          subtitle="Internal tracking, approval monitoring, and document archive."
        />

        {/* HEADER */}
        <section className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-blue-600">
              Document Management
            </p>

            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#071739]">
              Internal Documents
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              Track document progress, approvals,
              priorities, and completed files.
            </p>
          </div>

          <button
            onClick={() =>
              fetchDocuments(true)
            }
            disabled={refreshing}
            className="flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-[#071739] shadow-sm transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </section>

        {/* KPI */}
        <section className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <StatCard
            title="Total Documents"
            value={String(
              analytics.total
            )}
            icon={FileText}
          />

          <StatCard
            title="Pending Process"
            value={String(
              analytics.pending
            )}
            icon={Clock3}
          />

          <StatCard
            title="Completed"
            value={String(
              analytics.completed
            )}
            icon={CheckCircle2}
          />

          <StatCard
            title="Urgent"
            value={String(
              analytics.urgent
            )}
            icon={AlertTriangle}
          />
        </section>

        {/* FILTER BAR */}
        <section className="mt-5 rounded-2xl border border-white/70 bg-white/80 p-3 shadow-sm backdrop-blur-xl">
          <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
            {/* SEARCH */}
            <div className="relative min-w-0 flex-1">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search title, document number, type, requester..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs font-medium text-[#071739] shadow-sm outline-none transition focus:border-blue-400"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {/* STATUS */}
              <select
                value={selectedStatus}
                onChange={(event) =>
                  setSelectedStatus(
                    event.target.value
                  )
                }
                className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-bold text-[#071739] shadow-sm outline-none focus:border-blue-400"
              >
                {statusOptions.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status ===
                      "All"
                        ? "All Status"
                        : status}
                    </option>
                  )
                )}
              </select>

              {/* TYPE */}
              <select
                value={selectedType}
                onChange={(event) =>
                  setSelectedType(
                    event.target.value
                  )
                }
                className="h-9 max-w-[180px] rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-bold text-[#071739] shadow-sm outline-none focus:border-blue-400"
              >
                {typeOptions.map(
                  (type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type === "All"
                        ? "All Types"
                        : type}
                    </option>
                  )
                )}
              </select>

              {/* PRIORITY */}
              <select
                value={
                  selectedPriority
                }
                onChange={(event) =>
                  setSelectedPriority(
                    event.target.value
                  )
                }
                className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-bold text-[#071739] shadow-sm outline-none focus:border-blue-400"
              >
                {priorityOptions.map(
                  (priority) => (
                    <option
                      key={priority}
                      value={priority}
                    >
                      {priority ===
                      "All"
                        ? "All Priority"
                        : priority}
                    </option>
                  )
                )}
              </select>

              {/* SORT */}
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 shadow-sm">
                <ArrowUpDown
                  size={13}
                  className="text-slate-400"
                />

                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(
                      event.target.value
                    )
                  }
                  className="h-8 bg-transparent text-[11px] font-bold text-[#071739] outline-none"
                >
                  <option value="latest">
                    Latest Update
                  </option>

                  <option value="priority">
                    Priority
                  </option>

                  <option value="status">
                    Status
                  </option>

                  <option value="title">
                    Document Name
                  </option>
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="h-9 rounded-xl border border-red-100 bg-red-50 px-3 text-[11px] font-bold text-red-600 transition hover:bg-red-100"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
            <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400">
              <Filter size={12} />

              Showing{" "}
              <span className="font-extrabold text-[#071739]">
                {
                  filteredDocuments.length
                }
              </span>{" "}
              of{" "}
              <span className="font-extrabold text-[#071739]">
                {documents.length}
              </span>{" "}
              documents
            </div>

            <div className="hidden text-[10px] text-slate-400 sm:block">
              Auto-refresh every 60 seconds
            </div>
          </div>
        </section>

        {/* TABLE */}
        <section className="mt-4 overflow-hidden rounded-[24px] border border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(2,6,23,0.07)] backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full">
              <thead className="border-b border-slate-100 bg-slate-50/90">
                <tr>
                  <th className="px-4 py-3 text-left text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                    Document
                  </th>

                  <th className="px-4 py-3 text-left text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                    Type
                  </th>

                  <th className="px-4 py-3 text-left text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                    Requested By
                  </th>

                  <th className="px-4 py-3 text-left text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                    Approver
                  </th>

                  <th className="px-4 py-3 text-left text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                    Status
                  </th>

                  <th className="px-4 py-3 text-left text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                    Priority
                  </th>

                  <th className="px-4 py-3 text-left text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                    Updated
                  </th>

                  <th className="px-4 py-3 text-right text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({
                    length: 6,
                  }).map((_, index) => (
                    <tr
                      key={index}
                      className="border-b border-slate-100"
                    >
                      {Array.from({
                        length: 8,
                      }).map(
                        (_, cellIndex) => (
                          <td
                            key={
                              cellIndex
                            }
                            className="px-4 py-4"
                          >
                            <div className="h-4 animate-pulse rounded bg-slate-100" />
                          </td>
                        )
                      )}
                    </tr>
                  ))
                ) : filteredDocuments.length >
                  0 ? (
                  filteredDocuments.map(
                    (
                      doc,
                      index
                    ) => (
                      <tr
                        key={`${doc["Document Number"]}-${index}`}
                        className="border-b border-slate-100 transition hover:bg-blue-50/40"
                      >
                        {/* DOCUMENT */}
                        <td className="max-w-[260px] px-4 py-3">
                          <button
                            onClick={() =>
                              setSelectedDocument(
                                doc
                              )
                            }
                            className="text-left"
                          >
                            <p className="line-clamp-1 text-xs font-extrabold text-[#071739] hover:text-blue-700">
                              {doc.Title ||
                                "Untitled Document"}
                            </p>

                            <p className="mt-0.5 text-[9px] font-medium text-slate-400">
                              {doc[
                                "Document Number"
                              ] ||
                                "No document number"}
                            </p>
                          </button>
                        </td>

                        {/* TYPE */}
                        <td className="px-4 py-3 text-[10px] font-semibold text-slate-600">
                          {doc[
                            "Document Type"
                          ] || "-"}
                        </td>

                        {/* REQUESTED */}
                        <td className="px-4 py-3 text-[10px] font-semibold text-slate-600">
                          {doc[
                            "Requested By"
                          ] || "-"}
                        </td>

                        {/* APPROVER */}
                        <td className="px-4 py-3 text-[10px] font-semibold text-slate-600">
                          {doc.Approver ||
                            "-"}
                        </td>

                        {/* STATUS */}
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[9px] font-extrabold ${getStatusClass(
                              doc.Status
                            )}`}
                          >
                            {doc.Status ||
                              "Unknown"}
                          </span>
                        </td>

                        {/* PRIORITY */}
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-extrabold ${getPriorityClass(
                              doc.Priority
                            )}`}
                          >
                            {doc.Priority ||
                              "-"}
                          </span>
                        </td>

                        {/* UPDATED */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-500">
                            <CalendarDays
                              size={11}
                            />

                            {doc[
                              "Last Update"
                            ] ||
                              doc.Date ||
                              "-"}
                          </div>
                        </td>

                        {/* ACTION */}
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() =>
                                setSelectedDocument(
                                  doc
                                )
                              }
                              title="View details"
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                            >
                              <Eye
                                size={
                                  13
                                }
                              />
                            </button>

                            {doc[
                              "Draft Link"
                            ] && (
                              <a
                                href={
                                  doc[
                                    "Draft Link"
                                  ]
                                }
                                target="_blank"
                                rel="noreferrer"
                                title="Open draft"
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                              >
                                <ExternalLink
                                  size={
                                    13
                                  }
                                />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-16 text-center"
                    >
                      <FileText
                        size={36}
                        className="mx-auto text-slate-300"
                      />

                      <h3 className="mt-3 text-base font-extrabold text-[#071739]">
                        No Documents Found
                      </h3>

                      <p className="mt-1 text-[11px] text-slate-400">
                        Try changing your
                        search or filters.
                      </p>

                      {hasActiveFilters && (
                        <button
                          onClick={
                            clearFilters
                          }
                          className="mt-4 rounded-lg bg-[#071739] px-4 py-2 text-[10px] font-bold text-white hover:bg-blue-700"
                        >
                          Clear Filters
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* FOOTER SUMMARY */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1">
          <p className="text-[9px] font-medium text-slate-400">
            Internal Documents • Admissions
            Dashboard
          </p>

          <div className="flex items-center gap-3 text-[9px] font-semibold text-slate-400">
            <span>
              Completed:{" "}
              <b className="text-green-600">
                {analytics.completed}
              </b>
            </span>

            <span>
              Pending:{" "}
              <b className="text-orange-600">
                {analytics.pending}
              </b>
            </span>

            <span>
              Urgent:{" "}
              <b className="text-red-600">
                {analytics.urgent}
              </b>
            </span>
          </div>
        </div>
      </main>

      {/* DOCUMENT MODAL */}
      {selectedDocument && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
          onClick={() =>
            setSelectedDocument(null)
          }
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* MODAL HEADER */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-blue-600">
                  Document Details
                </p>

                <h2 className="mt-2 break-words text-2xl font-extrabold text-[#071739]">
                  {
                    selectedDocument.Title
                  }
                </h2>

                <p className="mt-1 text-[10px] font-medium text-slate-400">
                  {
                    selectedDocument[
                      "Document Number"
                    ]
                  }
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedDocument(
                    null
                  )
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              >
                <X size={17} />
              </button>
            </div>

            {/* STATUS STRIP */}
            <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50 p-3">
              <span
                className={`rounded-full border px-3 py-1 text-[9px] font-extrabold ${getStatusClass(
                  selectedDocument.Status
                )}`}
              >
                {selectedDocument.Status ||
                  "Unknown"}
              </span>

              <span
                className={`rounded-full border px-3 py-1 text-[9px] font-extrabold ${getPriorityClass(
                  selectedDocument.Priority
                )}`}
              >
                {selectedDocument.Priority ||
                  "No Priority"}
              </span>
            </div>

            {/* DETAILS */}
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
              <DetailItem
                label="Document Type"
                value={
                  selectedDocument[
                    "Document Type"
                  ]
                }
              />

              <DetailItem
                label="Requested By"
                value={
                  selectedDocument[
                    "Requested By"
                  ]
                }
              />

              <DetailItem
                label="Approver"
                value={
                  selectedDocument.Approver
                }
              />

              <DetailItem
                label="Date"
                value={
                  selectedDocument.Date
                }
              />

              <DetailItem
                label="Last Update"
                value={
                  selectedDocument[
                    "Last Update"
                  ]
                }
              />

              <DetailItem
                label="Document Number"
                value={
                  selectedDocument[
                    "Document Number"
                  ]
                }
              />
            </div>

            {/* REMARKS */}
            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                Remarks
              </p>

              <p className="mt-2 whitespace-pre-line text-xs leading-5 text-slate-600">
                {selectedDocument.Remarks ||
                  "No remarks available."}
              </p>
            </div>

            {/* LINKS */}
            <div className="mt-5 flex flex-wrap gap-2">
              {selectedDocument[
                "Draft Link"
              ] && (
                <a
                  href={
                    selectedDocument[
                      "Draft Link"
                    ]
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-[#071739] px-4 py-2.5 text-[10px] font-extrabold text-white transition hover:bg-blue-700"
                >
                  <ExternalLink
                    size={13}
                  />
                  Open Draft
                </a>
              )}

              {selectedDocument[
                "Signed Link"
              ] && (
                <a
                  href={
                    selectedDocument[
                      "Signed Link"
                    ]
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-[10px] font-extrabold text-white transition hover:bg-green-700"
                >
                  <ExternalLink
                    size={13}
                  />
                  Open Signed
                </a>
              )}

              {!selectedDocument[
                "Draft Link"
              ] &&
                !selectedDocument[
                  "Signed Link"
                ] && (
                  <span className="text-[10px] font-semibold text-slate-400">
                    No document links
                    available.
                  </span>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
      <p className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 break-words text-[11px] font-bold text-[#071739]">
        {value || "-"}
      </p>
    </div>
  );
}