import { StudyConfig } from '../../parser/types';
import { StoredAnswer } from '../../store/types';
import { ParticipantData } from '../types';

export abstract class StorageEngine {
  protected engine: string;

  protected connected = false;

  protected currentParticipantId: string | null = null;

  constructor(engine: string) {
    this.engine = engine;
  }

  isConnected() {
    return this.connected;
  }

  getEngine() {
    return this.engine;
  }

  abstract connect(): Promise<void>;

  abstract initializeStudyDb(studyId: string, config: StudyConfig): Promise<void>;

  abstract initializeParticipantSession(searchParams: Record<string, string>, config: StudyConfig, urlParticipantId?: string): Promise<ParticipantData>;

  abstract getCurrentParticipantId(urlParticipantId?: string): Promise<string>;

  abstract clearCurrentParticipantId(): Promise<void>;

  abstract saveAnswer(currentStep: string, answer: StoredAnswer): Promise<void>;

  abstract setSequenceArray(latinSquare: string[][]): Promise<void>;

  abstract getSequenceArray(): Promise<string[][] | null>;

  abstract getSequence(): Promise<string[]>;

  abstract getAllParticipantsData(): Promise<ParticipantData[]>;

  abstract getParticipantData(): Promise<ParticipantData | null>;

  abstract nextParticipant(config: StudyConfig): Promise<ParticipantData>;

  abstract verifyCompletion(answers: Record<string, StoredAnswer>): Promise<boolean>;
}
