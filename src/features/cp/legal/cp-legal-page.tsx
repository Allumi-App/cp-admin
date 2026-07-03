import { useNavigate } from 'react-router'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { FileText, Pencil, GripVertical } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { useOrderedList } from '../lib/use-ordered-list'
import { useCpLegalDocuments, useReorderCpLegalDocuments, CP_LEGAL_LABELS } from './use-cp-legal'

export function CpLegalPage() {
  const { data: serverDocuments, isLoading } = useCpLegalDocuments()
  const reorderDocs = useReorderCpLegalDocuments()
  const { items: documents, onDragEnd } = useOrderedList(serverDocuments, reorderDocs.mutate)
  const navigate = useNavigate()

  return (
    <div>
      <PageHeader title="Legal Documents" />

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="cp-legal-documents">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {documents.map((doc, index) => (
                  <Draggable key={doc.id} draggableId={doc.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-card rounded-2xl border border-border/60 p-3.5 flex items-center gap-3 transition-shadow ${
                          snapshot.isDragging ? 'shadow-lg' : 'hover:bg-black/[0.04]'
                        }`}
                      >
                        <div {...provided.dragHandleProps} className="text-muted-foreground cursor-grab">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div className="p-2.5 bg-secondary rounded-2xl">
                          <FileText className="w-5 h-5 text-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[15px]">{CP_LEGAL_LABELS[doc.slug] || doc.slug}</h3>
                          <p className="text-xs text-muted-foreground">
                            Last updated: {new Date(doc.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => navigate(`/cp/legal/${doc.id}`)}
                          className="text-foreground p-1.5 rounded-lg hover:bg-black/[0.08] transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  )
}
