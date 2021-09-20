import React, { ReactNode } from 'react'
import { Box } from '@chakra-ui/react'

type WrapperSize = 'regular' | 'small'

interface IWapperProps {
    children: ReactNode,
    size?: WrapperSize
}

const Wrapper = ({children, size = 'regular'}: IWapperProps) => {
    return (
        <Box maxWidth={size === 'regular' ? '800px' : '400px'} w='100%' mt={8} mx='auto'>
            {children}
        </Box>
    )
}

export default Wrapper
