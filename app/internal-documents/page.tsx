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

const STATUS_COLORS: Record<
  string,
  string
> = {
  Draft:
    "bg-slate-100 text-slate-700",

  "Finance Check":
    "bg-yellow-100 text-yellow-700",

  Revision:
    "bg-orange-100 text-orange-700",

  "Approval Ezra":
    "bg-blue-100 text-blue-700",

  "Approval Finance":
    "bg-cyan-100 text-cyan-700",

  Process:
    "bg-purple-100 text-purple-700",

  Completed:
    "bg-green-100 text-green-700",

  Rejected:
    "bg-red-100 text-red-700",

  Archived:
    "bg-slate-200 text-slate-600",
};

const PRIORITY_COLORS: Record<
  string,
  string
> = {
  Low:
    "bg-green-100 text-green-700",

  Medium:
    "bg-yellow-100 text-yellow-700",

  High:
    "bg-orange-100 text-orange-700",

  Urgent:
    "bg-red-100 text-red-700",
};

export default function InternalDocumentsPage() {
  const [
    documents,
    setDocuments,
  ] = useState<
    DocumentItem[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState("All");

  const [
    selectedDocument,
    setSelectedDocument,
  ] =
    useState<DocumentItem | null>(
      null
    );

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const res =
          await fetch(
            "https://opensheet.elk.sh/1e0senJvlGjTWxaOlAzcuocyjjlc_6EVWZ69u0cZX_Ig/DOCUMENT_TRACKER"
          );

        const data =
          await res.json();

        if (
          Array.isArray(data)
        ) {
          setDocuments(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchDocuments();
  }, []);

  const filteredDocuments =
    useMemo(() => {
      return documents.filter(
        (doc) => {
          const matchesSearch =
            doc.Title?.toLowerCase().includes(
              searchTerm.toLowerCase()
            ) ||
            doc[
              "Document Number"
            ]
              ?.toLowerCase()
              .includes(
                searchTerm.toLowerCase()
              );

          const matchesStatus =
            selectedStatus ===
              "All" ||
            doc.Status ===
              selectedStatus;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      documents,
      searchTerm,
      selectedStatus,
    ]);

  const analytics =
    useMemo(() => {
      return {
        total:
          documents.length,

        pending:
          documents.filter(
            (doc) =>
              doc.Status !==
                "Completed" &&
              doc.Status !==
                "Archived"
          ).length,

        completed:
          documents.filter(
            (doc) =>
              doc.Status ===
              "Completed"
          ).length,

        urgent:
          documents.filter(
            (doc) =>
              doc.Priority ===
              "Urgent"
          ).length,
      };
    }, [documents]);

  return (
    <div
  className={`${jakarta.className} flex min-h-screen bg-[#F4F7FB]`}
>
      <Sidebar />

      <section className="flex-1 p-10">
        <Topbar />

        {/* Analytics */}
        <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Documents"
            value={
              analytics.total
            }
            icon={
              FileText
            }
          />

          <StatCard
            title="Pending Process"
            value={
              analytics.pending
            }
            icon={Clock3}
          />

          <StatCard
            title="Completed"
            value={
              analytics.completed
            }
            icon={
              CheckCircle2
            }
          />

          <StatCard
            title="Urgent"
            value={
              analytics.urgent
            }
            icon={
              AlertTriangle
            }
          />
        </section>

        {/* Controls */}
        <section className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-700">
              Marketing Documents
            </p>

            <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-[#071739]">
              Internal Documents
            </h1>

            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-500">
              Internal tracking,
              approval monitoring,
              and archive system.
            </p>
          </div>

          <div className="flex flex-col gap-4 md:flex-row">
            {/* Search */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search document..."
                value={
                  searchTerm
                }
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
                className="h-14 w-[280px] rounded-2xl border border-slate-200 bg-white pl-12 pr-5 text-sm font-medium text-[#071739] shadow-sm outline-none transition focus:border-blue-400"
              />
            </div>

            {/* Filter */}
            <select
              value={
                selectedStatus
              }
              onChange={(e) =>
                setSelectedStatus(
                  e.target.value
                )
              }
              className="h-14 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-[#071739] shadow-sm outline-none transition focus:border-blue-400"
            >
              <option>
                All
              </option>

              <option>
                Draft
              </option>

              <option>
                Finance Check
              </option>

              <option>
                Revision
              </option>

              <option>
                Approval Ezra
              </option>

              <option>
                Approval Finance
              </option>

              <option>
                Process
              </option>

              <option>
                Completed
              </option>

              <option>
                Rejected
              </option>

              <option>
                Archived
              </option>
            </select>
          </div>
        </section>

        {/* Table */}
        <section className="mt-10 overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_25px_80px_rgba(2,6,23,0.08)] backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  {[
                    "Document",
                    "Type",
                    "Requested By",
                    "Approver",
                    "Status",
                    "Priority",
                    "Actions",
                  ].map(
                    (
                      header
                    ) => (
                      <th
                        key={
                          header
                        }
                        className="px-6 py-5 text-left text-sm font-bold uppercase tracking-wide text-slate-500"
                      >
                        {
                          header
                        }
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {filteredDocuments.map(
                  (
                    doc,
                    index
                  ) => (
                    <tr
                      key={index}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      {/* Document */}
                      <td className="px-6 py-5">
                        <div>
                          <h3 className="font-bold text-[#071739]">
                            {
                              doc.Title
                            }
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {
                              doc[
                                "Document Number"
                              ]
                            }
                          </p>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-5 text-sm font-semibold text-slate-700">
                        {
                          doc[
                            "Document Type"
                          ]
                        }
                      </td>

                      {/* Requested */}
                      <td className="px-6 py-5 text-sm font-medium text-slate-600">
                        {
                          doc[
                            "Requested By"
                          ]
                        }
                      </td>

                      {/* Approver */}
                      <td className="px-6 py-5 text-sm font-medium text-slate-600">
                        {
                          doc.Approver
                        }
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-4 py-2 text-xs font-bold ${STATUS_COLORS[doc.Status]}`}
                        >
                          {
                            doc.Status
                          }
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-4 py-2 text-xs font-bold ${PRIORITY_COLORS[doc.Priority]}`}
                        >
                          {
                            doc.Priority
                          }
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              setSelectedDocument(
                                doc
                              )
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                          >
                            <Eye
                              size={
                                18
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
                              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                            >
                              <ExternalLink
                                size={
                                  18
                                }
                              />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            {!loading &&
              filteredDocuments.length ===
                0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <FileText
                    size={50}
                    className="text-slate-300"
                  />

                  <h3 className="mt-5 text-2xl font-bold text-[#071739]">
                    No Documents
                  </h3>

                  <p className="mt-2 text-slate-500">
                    No matching
                    documents found.
                  </p>
                </div>
              )}
          </div>
        </section>

        {/* Modal */}
        {selectedDocument && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl rounded-[36px] bg-white p-8 shadow-2xl">
              {/* Close */}
              <button
                onClick={() =>
                  setSelectedDocument(
                    null
                  )
                }
                className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
              >
                <X
                  size={20}
                />
              </button>

              <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-700">
                Document Preview
              </p>

              <h2 className="mt-4 text-5xl font-extrabold tracking-tight text-[#071739]">
                {
                  selectedDocument.Title
                }
              </h2>

              <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Document Number
                  </p>

                  <p className="mt-2 font-bold text-[#071739]">
                    {
                      selectedDocument[
                        "Document Number"
                      ]
                    }
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Document Type
                  </p>

                  <p className="mt-2 font-bold text-[#071739]">
                    {
                      selectedDocument[
                        "Document Type"
                      ]
                    }
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Requested By
                  </p>

                  <p className="mt-2 font-bold text-[#071739]">
                    {
                      selectedDocument[
                        "Requested By"
                      ]
                    }
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Approver
                  </p>

                  <p className="mt-2 font-bold text-[#071739]">
                    {
                      selectedDocument.Approver
                    }
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Status
                  </p>

                  <span
                    className={`mt-3 inline-flex rounded-full px-4 py-2 text-xs font-bold ${STATUS_COLORS[selectedDocument.Status]}`}
                  >
                    {
                      selectedDocument.Status
                    }
                  </span>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Priority
                  </p>

                  <span
                    className={`mt-3 inline-flex rounded-full px-4 py-2 text-xs font-bold ${PRIORITY_COLORS[selectedDocument.Priority]}`}
                  >
                    {
                      selectedDocument.Priority
                    }
                  </span>
                </div>
              </div>

              {/* Remarks */}
              <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Remarks
                </p>

                <p className="mt-3 leading-relaxed text-slate-600">
                  {
                    selectedDocument.Remarks ||
                    "-"
                  }
                </p>
              </div>

              {/* Buttons */}
              <div className="mt-8 flex flex-wrap gap-4">
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
                    className="rounded-2xl bg-[#071739] px-6 py-4 font-bold text-white transition hover:bg-[#12337a]"
                  >
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
                    className="rounded-2xl bg-green-600 px-6 py-4 font-bold text-white transition hover:bg-green-700"
                  >
                    Open Signed
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}