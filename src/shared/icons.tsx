import { HugeiconsIcon } from '@hugeicons/react'
import {
  Key01Icon,
  Building02Icon,
  Settings01Icon,
  PlusSignIcon,
  Edit01Icon,
  Delete01Icon,
  ArrowDown01Icon,
  Link01Icon,
  AtIcon,
  Download01Icon,
  Upload01Icon,
  DragDropVerticalIcon,
} from '@hugeicons/core-free-icons'

type IconProps = { size?: number; color?: string; strokeWidth?: number }
const D = { size: 16, color: 'currentColor', strokeWidth: 1.5 }

export function KeyIcon({ size = D.size, color = D.color, strokeWidth = D.strokeWidth }: IconProps) {
  return <HugeiconsIcon icon={Key01Icon} size={size} color={color} strokeWidth={strokeWidth} />
}

export function BuildingIcon({ size = D.size, color = D.color, strokeWidth = D.strokeWidth }: IconProps) {
  return <HugeiconsIcon icon={Building02Icon} size={size} color={color} strokeWidth={strokeWidth} />
}

export function SettingsIcon({ size = D.size, color = D.color, strokeWidth = D.strokeWidth }: IconProps) {
  return <HugeiconsIcon icon={Settings01Icon} size={size} color={color} strokeWidth={strokeWidth} />
}

export function PlusIcon({ size = D.size, color = D.color, strokeWidth = D.strokeWidth }: IconProps) {
  return <HugeiconsIcon icon={PlusSignIcon} size={size} color={color} strokeWidth={strokeWidth} />
}

export function PencilIcon({ size = D.size, color = D.color, strokeWidth = D.strokeWidth }: IconProps) {
  return <HugeiconsIcon icon={Edit01Icon} size={size} color={color} strokeWidth={strokeWidth} />
}

export function TrashIcon({ size = D.size, color = D.color, strokeWidth = D.strokeWidth }: IconProps) {
  return <HugeiconsIcon icon={Delete01Icon} size={size} color={color} strokeWidth={strokeWidth} />
}

export function ChevronDownIcon({ size = D.size, color = D.color, strokeWidth = D.strokeWidth }: IconProps) {
  return <HugeiconsIcon icon={ArrowDown01Icon} size={size} color={color} strokeWidth={strokeWidth} />
}

export function ExternalLinkIcon({ size = D.size, color = D.color, strokeWidth = D.strokeWidth }: IconProps) {
  return <HugeiconsIcon icon={Link01Icon} size={size} color={color} strokeWidth={strokeWidth} />
}

export function AtTriggerIcon({ size = D.size, color = D.color, strokeWidth = D.strokeWidth }: IconProps) {
  return <HugeiconsIcon icon={AtIcon} size={size} color={color} strokeWidth={strokeWidth} />
}

export function DownloadIcon({ size = D.size, color = D.color, strokeWidth = D.strokeWidth }: IconProps) {
  return <HugeiconsIcon icon={Download01Icon} size={size} color={color} strokeWidth={strokeWidth} />
}

export function UploadIcon({ size = D.size, color = D.color, strokeWidth = D.strokeWidth }: IconProps) {
  return <HugeiconsIcon icon={Upload01Icon} size={size} color={color} strokeWidth={strokeWidth} />
}

export function DragHandleIcon({ size = D.size, color = D.color, strokeWidth = D.strokeWidth }: IconProps) {
  return <HugeiconsIcon icon={DragDropVerticalIcon} size={size} color={color} strokeWidth={strokeWidth} />
}
