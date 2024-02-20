import {
  Center,
  Group,
  Text,
  Input, Slider, SliderProps,
} from '@mantine/core';
import { SliderResponse } from '../../parser/types';
import { generateErrorMessage } from './utils';
import ReactMarkdownWrapper from '../ReactMarkdownWrapper';

type inputProps = {
  response: SliderResponse;
  disabled: boolean;
  answer: object;
};

export default function SliderInput({
  response,
  disabled,
  answer,
}: inputProps) {
  const {
    prompt, options, leftLabel, rightLabel, required,
  } = response;

  const errorMessage = generateErrorMessage(response, answer);
  return (
    <Input.Wrapper
      withAsterisk={required}
      label={<ReactMarkdownWrapper text={prompt} />}
      error={errorMessage}
      size="md"
    >
      <Group>
        {leftLabel ? <Center><Text>{leftLabel}</Text></Center> : null}
        <Slider
          disabled={disabled}
        // labelAlwaysOnx
          label={null}
          sx={{ marginTop: '15px', marginBottom: '15px', width: '400px' }}
          marks={options as SliderProps['marks']}
          {...answer}
          defaultValue={50}
          min={0}
          max={100}
          showLabelOnHover={false}
          styles={(theme) => ({
            markFilled: {
              borderColor: '#E9ECEF',
              backgroundColor: 'white',
            },
            bar: {
              backgroundColor: '#E9ECEF',
            },
            markLabel: {
              fontSize: theme.fontSizes.sm,
              marginBottom: 5,
              marginTop: 0,
            },
          })}
        />
        {rightLabel ? <Center><Text>{rightLabel}</Text></Center> : null}
      </Group>
    </Input.Wrapper>
  );
}
