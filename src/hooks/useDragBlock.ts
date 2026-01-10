'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { PIXELS_PER_MINUTE } from '@/lib/constants';

interface UseDragBlockProps {
  blockId: string;
  initialStartMin: number;
  initialEndMin: number;
  dayStartMin: number;
  dayEndMin: number;
  gridMinutes: number;
  onDragEnd: (blockId: string, newStartMin: number, newEndMin: number) => Promise<void>;
  enabled?: boolean;
}

interface DragState {
  isDragging: boolean;
  wasDragging: boolean;
  startY: number;
  currentStartMin: number;
  currentEndMin: number;
  dragOffsetY: number;
}

export function useDragBlock({
  blockId,
  initialStartMin,
  initialEndMin,
  dayStartMin,
  dayEndMin,
  gridMinutes,
  onDragEnd,
  enabled = true,
}: UseDragBlockProps) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    wasDragging: false,
    startY: 0,
    currentStartMin: initialStartMin,
    currentEndMin: initialEndMin,
    dragOffsetY: 0,
  });

  const dragRef = useRef<DragState>(dragState);
  const initialValuesRef = useRef({ startMin: initialStartMin, endMin: initialEndMin });

  // Update refs when state changes
  dragRef.current = dragState;

  // Update initial values when props change (e.g., after API update)
  useEffect(() => {
    initialValuesRef.current = { startMin: initialStartMin, endMin: initialEndMin };
    if (!dragRef.current.isDragging) {
      setDragState(prev => ({
        ...prev,
        currentStartMin: initialStartMin,
        currentEndMin: initialEndMin,
        wasDragging: false,
      }));
    }
  }, [initialStartMin, initialEndMin]);

  // Snap to grid based on gridMinutes setting
  const snapToGrid = useCallback((minutes: number): number => {
    return Math.round(minutes / gridMinutes) * gridMinutes;
  }, [gridMinutes]);

  // Mouse down - start dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!enabled) return;

    e.preventDefault();
    e.stopPropagation();

    setDragState({
      isDragging: true,
      wasDragging: false,
      startY: e.clientY,
      currentStartMin: initialValuesRef.current.startMin,
      currentEndMin: initialValuesRef.current.endMin,
      dragOffsetY: 0,
    });
  }, [enabled]);

  // Mouse move - update offset only (no state recalculation for smooth movement)
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragRef.current.isDragging) return;

    const deltaY = e.clientY - dragRef.current.startY;
    const duration = initialValuesRef.current.endMin - initialValuesRef.current.startMin;

    // Calculate bounds in pixels
    const minOffset = (dayStartMin - initialValuesRef.current.startMin) * PIXELS_PER_MINUTE;
    const maxOffset = (dayEndMin - duration - initialValuesRef.current.startMin) * PIXELS_PER_MINUTE;

    // Clamp offset within bounds
    const clampedOffset = Math.max(minOffset, Math.min(maxOffset, deltaY));

    setDragState(prev => ({
      ...prev,
      dragOffsetY: clampedOffset,
    }));
  }, [dayStartMin, dayEndMin]);

  // Mouse up - end dragging (apply snap only on drop)
  const handleMouseUp = useCallback(async () => {
    if (!dragRef.current.isDragging) return;

    const { dragOffsetY } = dragRef.current;
    const { startMin: origStart, endMin: origEnd } = initialValuesRef.current;
    const duration = origEnd - origStart;

    // Calculate new time from offset and apply snap
    const deltaMinutes = dragOffsetY / PIXELS_PER_MINUTE;
    const newStartMin = origStart + deltaMinutes;
    const snappedStartMin = snapToGrid(newStartMin);
    const snappedEndMin = snappedStartMin + duration;

    setDragState(prev => ({
      ...prev,
      isDragging: false,
      wasDragging: true,
      dragOffsetY: 0,
      currentStartMin: snappedStartMin,
      currentEndMin: snappedEndMin,
    }));

    // Only call API if time actually changed
    if (snappedStartMin !== origStart || snappedEndMin !== origEnd) {
      try {
        await onDragEnd(blockId, snappedStartMin, snappedEndMin);
      } catch {
        // Rollback on error
        setDragState(prev => ({
          ...prev,
          currentStartMin: origStart,
          currentEndMin: origEnd,
        }));
      }
    }
  }, [blockId, onDragEnd, snapToGrid]);

  // Global event listeners for drag
  useEffect(() => {
    if (dragState.isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  const clearWasDragging = useCallback(() => {
    setDragState(prev => ({ ...prev, wasDragging: false }));
  }, []);

  return {
    isDragging: dragState.isDragging,
    wasDragging: dragState.wasDragging,
    dragOffsetY: dragState.dragOffsetY,
    handleMouseDown,
    clearWasDragging,
  };
}
