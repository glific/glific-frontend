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
import { useState } from 'react';
import styles from './FormBuilder.module.css';
import { Screen } from './FormBuilder.types';
import { ScreenComponent } from './Screen/Screen';

export const FormBuilder = () => {
  const [screens, setScreens] = useState<Screen[]>([
    {
      id: '1',
      name: 'Screen 1',
      order: 0,
      content: [],
      buttonLabel: '',
    },
  ]);
  const [expandedScreenId, setExpandedScreenId] = useState<string | null>('1');

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

  const addContent = (screenId: string) => {
    // Placeholder for adding content to a screen
    console.log('Add content to screen:', screenId);
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
                onAddContent={() => addContent(screen.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};
