// React Imports
import { useRef } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import { styled } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import NavHeader from '@menu/components/vertical-menu/NavHeader'
import Logo from '@components/layout/shared/Logo'
import NavCollapseIcons from '@menu/components/vertical-menu/NavCollapseIcons'

// Hook Imports
import useHorizontalNav from '@menu/hooks/useHorizontalNav'

// Util Imports
import { mapHorizontalToVerticalMenu } from '@menu/utils/menuUtils'

const StyledBoxForShadow = styled('div')(({ theme }) => ({
  top: 60,
  left: -8,
  zIndex: 2,
  opacity: 0,
  position: 'absolute',
  pointerEvents: 'none',
  width: 'calc(100% + 15px)',
  height: theme.mixins.toolbar.minHeight,
  transition: 'opacity .15s ease-in-out',
  background: `linear-gradient(var(--mui-palette-background-default) ${theme.direction === 'rtl' ? '95%' : '5%'}, rgb(var(--mui-palette-background-defaultChannel) / 0.85) 30%, rgb(var(--mui-palette-background-defaultChannel) / 0.5) 65%, rgb(var(--mui-palette-background-defaultChannel) / 0.3) 75%, transparent)`,
  '&.scrolled': {
    opacity: 1
  }
}))

const VerticalNavContent = ({ children }) => {
  // Hooks
  const { isBreakpointReached } = useHorizontalNav()

  // Refs
  const shadowRef = useRef(null)

  // Vars
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  const scrollMenu = (container, isPerfectScrollbar) => {
    container = isBreakpointReached || !isPerfectScrollbar ? container.target : container

    if (shadowRef && container.scrollTop > 0) {
      // @ts-ignore
      if (!shadowRef.current.classList.contains('scrolled')) {
        // @ts-ignore
        shadowRef.current.classList.add('scrolled')
      }
    } else {
      // @ts-ignore
      shadowRef.current.classList.remove('scrolled')
    }
  }

  return (
    <>
      <NavHeader>
        <Link href='/'>
          <Logo />
        </Link>
        <NavCollapseIcons
          lockedIcon={<i className='ri-radio-button-line text-xl' />}
          unlockedIcon={<i className='ri-checkbox-blank-circle-line text-xl' />}
          closeIcon={<i className='ri-close-line text-xl' />}
          className='text-textSecondary'
        />
      </NavHeader>
      <StyledBoxForShadow ref={shadowRef} />
      <ScrollWrapper
        {...(isBreakpointReached
          ? {
              className: 'bs-full overflow-y-auto overflow-x-hidden',
              onScroll: container => scrollMenu(container, false)
            }
          : {
              options: { wheelPropagation: false, suppressScrollX: true },
              onScrollY: container => scrollMenu(container, true)
            })}
      >
        {mapHorizontalToVerticalMenu(children)}
      </ScrollWrapper>
    </>
  )
}

export default VerticalNavContent
