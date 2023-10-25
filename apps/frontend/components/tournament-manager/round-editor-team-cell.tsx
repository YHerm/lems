import { useState } from 'react';
import { WithId } from 'mongodb';
import { Field, FieldProps } from 'formik';
import { Autocomplete, TextField, Button, Typography } from '@mui/material';
import { Team } from '@lems/types';

interface RoundEditorTeamCellProps {
  name: string;
  teams: Array<WithId<Team>>;
  disabled: boolean;
}

const RoundEditorTeamCell: React.FC<RoundEditorTeamCellProps> = ({ name, teams, disabled }) => {
  const [editable, setEditable] = useState<boolean>(false);
  let dropdownOptions: Array<WithId<Team> | null> = [null];
  dropdownOptions = dropdownOptions.concat(teams.sort((a, b) => a.number - b.number));

  //TODO: typing for all matchData attributes
  return (
    <Field
      name={name}
      component={({ field, form }: FieldProps) =>
        editable ? (
          <Autocomplete
            options={dropdownOptions.sort((a, b) => {
              if (!a) return -1;
              if (!b) return 1;

              return (
                Object.values(form.values)
                  .flatMap((matchData: any) => Object.values(matchData))
                  .filter(v => v === a).length -
                Object.values(form.values)
                  .flatMap((matchData: any) => Object.values(matchData))
                  .filter(v => v === b).length
              );
            })}
            getOptionLabel={team => (team ? team.number.toString() : '-')}
            groupBy={team =>
              !team
                ? ''
                : Object.values(form.values)
                    .flatMap((matchData: any) => Object.values(matchData))
                    .filter(v => v === team).length < 1
                ? 'חסר'
                : 'קיים'
            }
            inputMode="search"
            disableClearable={field.value !== null}
            disabled={disabled}
            renderInput={params => (
              <TextField
                {...params}
                variant="standard"
                InputProps={{
                  ...params.InputProps,
                  disableUnderline: true
                }}
              />
            )}
            sx={{
              '& .MuiAutocomplete-inputRoot': {
                color:
                  Object.values(form.values)
                    .flatMap((matchData: any) => Object.values(matchData))
                    .filter(v => v === field.value).length > 1
                    ? '#f57c00'
                    : ''
              }
            }}
            value={field.value}
            onChange={(_e, newValue) => form.setFieldValue(field.name, newValue)}
          />
        ) : (
          <Button
            variant="text"
            onClick={e => setEditable(true)}
            sx={{
              '&:hover': {
                backgroundColor:
                  field.value &&
                  Object.values(form.values)
                    .flatMap((matchData: any) => Object.values(matchData))
                    .filter(v => v === field.value).length > 1
                    ? '#f57c00'
                    : '#f7f5f5'
              }
            }}
          >
            <Typography
              sx={{
                color:
                  field.value &&
                  Object.values(form.values)
                    .flatMap((matchData: any) => Object.values(matchData))
                    .filter(v => v === field.value).length > 1
                    ? '#f57c00'
                    : '#000'
              }}
            >
              {field.value ? field.value.number.toString() : '-'}
            </Typography>
          </Button>
        )
      }
    />
  );
};

export default RoundEditorTeamCell;