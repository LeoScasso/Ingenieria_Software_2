import {
  Visibility,
  VisibilityOff
} from '@mui/icons-material'
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  useTheme,
  MenuItem,
  FormControlLabel,
  Checkbox
} from '@mui/material'
import React from 'react'

const CustomForm = ({
  title,
  fields,
  onSubmit,
  submitButtonText = 'Enviar',
  paperStyles = {},
  formStyles = {},
  children,
}) => {
  const theme = useTheme()

  const getFieldType = (field) => {
    if (field.type === 'password' && field.showPassword !== undefined) {
      return field.showPassword ? 'text' : 'password'
    }
    return field.type || 'text'
  }

  const renderField = (field) => {
    const commonProps = {
      key: field.name,
      margin: 'normal',
      fullWidth: true,
      required: field.required,
      id: field.name,
      label: field.label,
      name: field.name,
      value: field.value,
      onChange: field.onChange,
      error: field.error,
      helperText: field.helperText,
      autoComplete: field.autoComplete,
      disabled: field.disabled,
      sx: {
        input: {
          color: theme.palette.beige,
          '&:-webkit-autofill': {
            WebkitBoxShadow: `0 0 0 100px ${theme.palette.slateGray} inset`,
            WebkitTextFillColor: theme.palette.beige,
            caretColor: theme.palette.beige,
          },
        },
        '& .MuiSelect-select': {
          color: theme.palette.beige, // o '#fff' si querés blanco blanco
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.beanBlue,
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.ming,
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.beige,
        },
        ...field.sx,
      },
      InputLabelProps: {
        style: { color: theme.palette.beige },
      },
      ...field.additionalProps,
    }

    // Campos especiales
    switch (field.type) {
      case 'select':
        return (
          <TextField {...commonProps} select>
            {(field.options || []).map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        )

      case 'checkbox':
        return (
          <FormControlLabel
            key={field.name}
            control={
              <Checkbox
                checked={!!field.value}
                onChange={field.onChange}
                name={field.name}
                disabled={field.disabled}
                sx={{ color: theme.palette.beige }}
              />
            }
            label={field.label}
            sx={{ color: theme.palette.beige }}
          />
        )

      case 'textarea':
        return (
          <TextField
            {...commonProps}
            multiline
            rows={field.rows || 4}
          />
        )

      case 'password':
        return (
          <TextField
            {...commonProps}
            type={getFieldType(field)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={field.onTogglePassword}
                    edge="end"
                    sx={{ color: theme.palette.beige }}
                  >
                    {field.showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )

      default:
        return (
          <TextField
            {...commonProps}
            type={getFieldType(field)}
          />
        )
    }
  }

  return (
    <Box
      component="main"
      maxWidth="xs"
      sx={{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        backgroundColor: theme.palette.darkBlue,
        ...formStyles,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.palette.slateGray,
          borderRadius: 2,
          maxWidth: 600,
          margin: '0 auto',
          ...paperStyles,
        }}
      >
        {title && (
          <Typography
            component="h1"
            variant="h5"
            sx={{
              mb: 3,
              color: theme.palette.beige,
            }}
          >
            {title}
          </Typography>
        )}

        <Box
          component="form"
          onSubmit={onSubmit}
          sx={{
            mt: 1,
            width: '100%',
          }}
        >
          {fields.map(renderField)}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              backgroundColor: theme.palette.beanBlue,
              color: theme.palette.beige,
              '&:hover': {
                backgroundColor: theme.palette.ming,
              },
            }}
          >
            {submitButtonText}
          </Button>

          {children && <Box sx={{ mt: 2 }}>{children}</Box>}
        </Box>
      </Paper>
    </Box>
  )
}

export default CustomForm
