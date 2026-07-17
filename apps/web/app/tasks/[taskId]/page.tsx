import { ActiveUserSelector } from "../../../components/active-user-selector";
import { TaskComments } from "../../../components/task-comments";

/** Renders the immutable discussion view for one task. */
export default async function TaskDetailPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  return (
    <main className="workspace">
      <div className="workspace-header">
        <div>
          <p className="eyebrow">Task detail</p>
          <h1>Task discussion</h1>
        </div>
        <ActiveUserSelector />
      </div>
      <TaskComments taskId={taskId} />
    </main>
  );
}
