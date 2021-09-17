import React, { ReactNode } from 'react'
import { Box } from '@chakra-ui/react'

interface IWapperProps {
    children: ReactNode
}

const Wrapper = ({children}: IWapperProps) => {
    return (
        <Box maxWidth='400px' w='100%' mt={8} mx='auto'>
            {children}
        </Box>
    )
}

export default Wrapper
