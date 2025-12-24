import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button } from 'components/UI/Form/Button/Button';
import { useState, useEffect } from 'react';
import styles from './FormBuilder.module.css';
import { FormBuilderProps, Screen } from './FormBuilder.types';
import { ScreenComponent } from './Screen/Screen';

export const FormBuilder = ({ onScreensChange, screens: externalScreens }: FormBuilderProps) => {
  const [internalScreens, setInternalScreens] = useState<Screen[]>([
    {
      id: '1',
      name: 'Screen 1',
      order: 0,
      content: [],
      buttonLabel: 'Continue',
    },
  ]);
  const [expandedScreenId, setExpandedScreenId] = useState<string | null>('1');
  const [expandedContentId, setExpandedContentId] = useState<string | null>(null);

  const screens = externalScreens || internalScreens;

  const setScreens = (updater: Screen[] | ((prev: Screen[]) => Screen[])) => {
    if (externalScreens && onScreensChange) {
      const newScreens = typeof updater === 'function' ? updater(externalScreens) : updater;
      onScreensChange(newScreens);
    } else {
      setInternalScreens(updater);
    }
  };

  useEffect(() => {
    if (!externalScreens) {
      onScreensChange?.(internalScreens);
    }
  }, [internalScreens, onScreensChange, externalScreens]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addNewScreen = () => {
    const newScreen: Screen = {
      id: Date.now().toString(),
      name: `Screen ${screens.length + 1}`,
      order: screens.length,
      content: [],
      buttonLabel: '',
    };
    setScreens([...screens, newScreen]);
    setExpandedScreenId(newScreen.id);
  };

  const deleteScreen = (id: string) => {
    const updatedScreens = screens
      .filter((screen) => screen.id !== id)
      .map((screen, index) => ({ ...screen, order: index }));
    setScreens(updatedScreens);
    if (expandedScreenId === id) {
      setExpandedScreenId(updatedScreens[0]?.id || null);
    }
  };

  const updateScreenName = (id: string, name: string) => {
    setScreens(screens.map((screen) => (screen.id === id ? { ...screen, name } : screen)));
  };

  const updateScreenButtonLabel = (id: string, buttonLabel: string) => {
    setScreens(screens.map((screen) => (screen.id === id ? { ...screen, buttonLabel } : screen)));
  };

  const toggleExpanded = (id: string) => {
    setExpandedScreenId(expandedScreenId === id ? null : id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setScreens((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const reorderedItems = arrayMove(items, oldIndex, newIndex);
        return reorderedItems.map((screen, index) => ({
          ...screen,
          order: index,
        }));
      });
    }
  };

  const addContent = (screenId: string, category: string, item: string) => {
    const newContentItem = {
      id: Date.now().toString(),
      type: category,
      name: item,
      order: 0,
      data: {
        id: item,
      },
    };

    setScreens(
      screens.map((screen) => {
        if (screen.id === screenId) {
          const newContent = [...screen.content, newContentItem].map((content, index) => ({
            ...content,
            order: index,
          }));
          return { ...screen, content: newContent };
        }
        return screen;
      })
    );

    setExpandedContentId(newContentItem.id);
  };

  const updateContent = (screenId: string, contentId: string, updates: any) => {
    setScreens(
      screens.map((screen) => {
        if (screen.id === screenId) {
          const updatedContent = screen.content.map((item) => (item.id === contentId ? { ...item, ...updates } : item));
          return { ...screen, content: updatedContent };
        }
        return screen;
      })
    );
  };

  const deleteContent = (screenId: string, contentId: string) => {
    setScreens(
      screens.map((screen) => {
        if (screen.id === screenId) {
          const updatedContent = screen.content
            .filter((item) => item.id !== contentId)
            .map((item, index) => ({ ...item, order: index }));
          return { ...screen, content: updatedContent };
        }
        return screen;
      })
    );
  };

  const reorderContent = (screenId: string, oldIndex: number, newIndex: number) => {
    setScreens(
      screens.map((screen) => {
        if (screen.id === screenId) {
          const reorderedContent = arrayMove(screen.content, oldIndex, newIndex);
          const updatedContent = reorderedContent.map((item, index) => ({
            ...item,
            order: index,
          }));
          return { ...screen, content: updatedContent };
        }
        return screen;
      })
    );
  };

  return (
    <div className={styles.formBuilder}>
      <div className={styles.header}>
        <h2>Screens</h2>
        <Button className={styles.addButton} variant="contained" onClick={addNewScreen}>
          + Add New
        </Button>
      </div>

      <div className={styles.screensList}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={screens.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {screens.map((screen) => (
              <ScreenComponent
                key={screen.id}
                screen={screen}
                isExpanded={expandedScreenId === screen.id}
                onToggleExpanded={() => toggleExpanded(screen.id)}
                onDelete={() => deleteScreen(screen.id)}
                onUpdateName={(name: string) => updateScreenName(screen.id, name)}
                onUpdateButtonLabel={(label: string) => updateScreenButtonLabel(screen.id, label)}
                onAddContent={(category: string, item: string) => addContent(screen.id, category, item)}
                onUpdateContent={(contentId: string, data: any) => updateContent(screen.id, contentId, data)}
                onDeleteContent={(contentId: string) => deleteContent(screen.id, contentId)}
                onReorderContent={(oldIndex: number, newIndex: number) => reorderContent(screen.id, oldIndex, newIndex)}
                expandedContentId={expandedContentId}
                setExpandedContentId={setExpandedContentId}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};
