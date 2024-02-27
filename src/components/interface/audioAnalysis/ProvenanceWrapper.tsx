import { Stack } from '@mantine/core';

import { useState } from 'react';
import { Analysis } from './Analysis';
import ComponentController from '../../../controllers/ComponentController';

export function ProvenanceWrapper() {
  const [provState, setProvState] = useState<unknown>();

  return (
    <Stack>
      <Analysis setProvState={setProvState} />
      <ComponentController provState={provState} />
    </Stack>
  );
}
