import { useForceUpdate } from '@mantine/hooks';
import { useEffect, useState } from 'react';

export function useTextHighlight(doc: Document | Window): Selection | null {
  const forceUpdate = useForceUpdate();
  const [selection, setSelection] = useState<Selection | null>(null);

  const handleSelectionChange = () => {
    setSelection(doc.getSelection());
    forceUpdate();
  };

  useEffect(() => {
    setSelection(doc.getSelection());
    doc.addEventListener('selectionchange', handleSelectionChange);
    return () => doc.removeEventListener('selectionchange', handleSelectionChange);
  }, [doc]);

  return selection;
}
