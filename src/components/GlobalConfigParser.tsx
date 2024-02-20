import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ConfigSwitcher from './ConfigSwitcher';
import { Shell } from './Shell';
import { parseGlobalConfig, parseStudyConfig } from '../parser/parser';
import { GlobalConfig, Nullable, StudyConfig } from '../parser/types';
import { PREFIX } from './Prefix';

async function fetchGlobalConfigArray() {
  const globalFile = await fetch(`${PREFIX}configs/global.json`);
  const configs = await globalFile.text();
  return parseGlobalConfig(configs);
}

async function fetchStudyConfigs(globalConfig: GlobalConfig) {
  const studyConfigs: { [key: string]: StudyConfig } = {};
  const urls = globalConfig.configsList.map(
    (configId) => `${PREFIX}${globalConfig.configs[configId].path}`,
  );

  const res = await Promise.all(urls.map((u) => fetch(u)))
    .then((responses) => Promise.all(responses.map((_res) => _res.text())))
    .then((responses) => Promise.all(responses.map((_res, idx) => parseStudyConfig(_res, globalConfig.configsList[idx]))));

  globalConfig.configsList.forEach((configId, idx) => {
    studyConfigs[configId] = res[idx];
  });
  return studyConfigs;
}

export function GlobalConfigParser() {
  const [globalConfig, setGlobalConfig] = useState<Nullable<GlobalConfig>>(null);
  const [studyConfigs, setStudyConfigs] = useState<Record<string, StudyConfig>>({});

  useEffect(() => {
    async function fetchData() {
      if (globalConfig) {
        setStudyConfigs(await fetchStudyConfigs(globalConfig));
      }
    }
    fetchData();
  }, [globalConfig]);

  useEffect(() => {
    if (globalConfig) return;

    fetchGlobalConfigArray().then((gc) => {
      setGlobalConfig(gc);
    });
  }, [globalConfig]);

  return globalConfig ? (
    <BrowserRouter basename={PREFIX}>
      <Routes>
        <Route
          path="/"
          element={(
            <ConfigSwitcher
              globalConfig={globalConfig}
              studyConfigs={studyConfigs}
            />
          )}
        />
        <Route
          path="/:studyId/*"
          element={<Shell globalConfig={globalConfig} />}
        />
      </Routes>
    </BrowserRouter>
  ) : null;
}
