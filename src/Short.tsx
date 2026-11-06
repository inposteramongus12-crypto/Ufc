import React from 'react';
import {Stub} from './stub';

// заглушка: сцены появятся вместе со сценарием
export const SHORT_FRAMES = 150;
export const Short: React.FC<{sound?: boolean}> = () => <Stub />;
