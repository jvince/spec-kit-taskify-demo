import { KanbanBoard } from "../../../components/kanban-board";

/** Displays a single project's live, role-aware Kanban board. */
export default async function ProjectBoardPage({
  params
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <main className="workspace">
      <p className="eyebrow">Project board</p>
      <h1>Kanban board</h1>
      <KanbanBoard projectId={projectId} />
    </main>
  );
}
