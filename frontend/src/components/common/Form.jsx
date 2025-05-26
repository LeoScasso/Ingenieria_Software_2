import { Visibility, VisibilityOff } from '@mui/icons-material'
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  useTheme,
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

  return (
    <Box
      component="main"
      maxWidth="xs"
      sx={{
        height: '80vh',
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
          {fields.map((field) => (
            <TextField
              key={field.name}
              margin="normal"
              required={field.required}
              fullWidth
              id={field.name}
              label={field.label}
              name={field.name}
              type={getFieldType(field)}
              value={field.value}
              onChange={field.onChange}
              error={field.error}
              helperText={field.helperText}
              autoComplete={field.autoComplete}
              disabled={field.disabled}
              InputLabelProps={{
                style: { color: theme.palette.beige },
              }}
              InputProps={{
                ...(field.type === 'password' && {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={field.onTogglePassword}
                        edge="end"
                        sx={{ color: theme.palette.beige }}
                      >
                        {field.showPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }),
              }}
              sx={{
                input: {
                  color: theme.palette.beige,
                  '&:-webkit-autofill': {
                    WebkitBoxShadow: `0 0 0 100px ${theme.palette.slateGray} inset`,
                    WebkitTextFillColor: theme.palette.beige,
                    caretColor: theme.palette.beige,
                  },
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: theme.palette.beanBlue,
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.ming,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.beige,
                  },
                },
                ...field.sx,
              }}
              {...field.additionalProps}
            />
          ))}

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
          {children && (
            <Box sx={{ mt: 2 }}>
              {children}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  )
}

export default CustomForm
