import React from 'react';
import Button from '../../../components/ui/Button';
import ActionMenu from '../../../components/ui/ActionMenu';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';

const ResultsToolbar = ({ onCopy, onSave, onShare, onExport }) => {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  return (
    <>
      <div className="flex flex-wrap gap-2 items-center">
        <Button variant="secondary" size="sm" iconName="Copy" onClick={onCopy}>
          Copy
        </Button>
        <Button variant="secondary" size="sm" iconName="Save" onClick={onSave}>
          Save
        </Button>
        <Button variant="secondary" size="sm" iconName="Share" onClick={onShare}>
          Share
        </Button>
        <Button variant="secondary" size="sm" iconName="Download" onClick={onExport}>
          Export
        </Button>
        <ActionMenu
          trigger={<Button variant="quiet" size="sm" iconName="MoreHorizontal" />}
          items={[
            { label: 'Duplizieren', onClick: onCopy, icon: <span>⧉</span> },
            { label: 'Entfernen', danger: true, onClick: () => setConfirmOpen(true) },
          ]}
        />
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Variante entfernen?"
        description="Diese Variante wird lokal entfernt."
        onConfirm={() => {
          setConfirmOpen(false);
          onExport?.();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
};

export default ResultsToolbar;
