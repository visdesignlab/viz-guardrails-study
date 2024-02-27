import { Suspense, useCallback } from 'react';
import { ModuleNamespace } from 'vite/types/hot';
import { ReactComponent } from '../parser/types';
import { useCurrentStep } from '../routes';
import { useStoreActions, useStoreDispatch } from '../store/store';
import { StimulusParams } from '../store/types';

const modules = import.meta.glob(
  '../public/**/*.{mjs,js,mts,ts,jsx,tsx}',
  { eager: true },
);

function ReactComponentController({ currentConfig, provState }: { currentConfig: ReactComponent; provState?: unknown; }) {
  const currentStep = useCurrentStep();

  const reactPath = `../public/${currentConfig.path}`;
  const StimulusComponent = (modules[reactPath] as ModuleNamespace).default;

  const storeDispatch = useStoreDispatch();
  const { updateResponseBlockValidation, setIframeAnswers } = useStoreActions();

  const setAnswer = useCallback(({ status, provenanceGraph, answers }: Parameters<StimulusParams<unknown, unknown>['setAnswer']>[0]) => {
    storeDispatch(updateResponseBlockValidation({
      location: 'sidebar',
      currentStep,
      status,
      values: answers,
      provenanceGraph,
    }));

    storeDispatch(setIframeAnswers(
      Object.values(answers).map((value) => value),
    ));
  }, [storeDispatch, currentStep]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StimulusComponent
        parameters={currentConfig.parameters}
        // eslint-disable-next-line react/jsx-no-bind
        setAnswer={setAnswer}
        provenanceState={provState}
      />
    </Suspense>
  );
}

export default ReactComponentController;
